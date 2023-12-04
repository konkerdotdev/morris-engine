import * as P from '@konker.dev/effect-ts-prelude';

import { UNSET_FACT } from '../engine/rules/facts';

export type Fact = [boolean, string];
export type Facts = Record<string, Fact>;

export const note = (fact: Fact): string => fact[1];
export const val = (fact: Fact): boolean => {
  // eslint-disable-next-line fp/no-throw
  if (note(fact) === UNSET_FACT) throw new Error('Unset fact access');
  return fact[0];
};

//---------------------------------------------------------------------------
export type Rule<C, F extends Facts, E> = {
  readonly rule: (context: C, facts: F) => P.Effect.Effect<never, E, F>;
  readonly note: string;
};

export type RuleSet<C, F extends Facts, E> = {
  readonly facts: F;
  readonly rules: Array<Rule<C, F, E>>;
};

export type RuleSetTransform<C, F extends Facts, E> = (ruleSet: RuleSet<C, F, E>) => RuleSet<C, F, E>;

export type RuleFunc<C, F extends Facts> = (context: C, facts: F) => boolean;

export type RuleFuncE<C, F extends Facts, E> = (context: C, facts: F) => P.Effect.Effect<never, E, boolean>;

//---------------------------------------------------------------------------
export const createRuleSet = <C, F extends Facts, E>(initialFacts: F): RuleSet<C, F, E> => ({
  facts: initialFacts,
  rules: [],
});

export const createRuleSetE = <C, F extends Facts, E>(initialFacts: F): P.Effect.Effect<never, E, RuleSet<C, F, E>> =>
  P.Effect.succeed(createRuleSet(initialFacts));

export const setFacts = <C, F extends Facts, E>(ruleSet: RuleSet<C, F, E>, facts: F): RuleSet<C, F, E> => ({
  ...ruleSet,
  facts,
});

export const sequence =
  <C, F extends Facts, E>(rulesList: ReadonlyArray<RuleSetTransform<C, F, E>>) =>
  (ruleSet: RuleSet<C, F, E>): RuleSet<C, F, E> => {
    return rulesList.reduce((acc, ruleTransform) => ruleTransform(acc), ruleSet);
  };

//---------------------------------------------------------------------------
export const setFactsE = <C, F extends Facts, E>(
  ruleSet: RuleSet<C, F, E>,
  facts: F
): P.Effect.Effect<never, E, RuleSet<C, F, E>> => P.Effect.succeed(setFacts(ruleSet, facts));

export const setFact =
  <F extends Facts>(key: keyof F, value: [boolean, string]) =>
  (facts: F): F => ({ ...facts, [key]: value });

export const setFactE =
  <F extends Facts, E>(key: keyof F, value: [boolean, string]) =>
  (facts: F): P.Effect.Effect<never, E, F> =>
    P.pipe(facts, setFact(key, value), P.Effect.succeed);

//---------------------------------------------------------------------------
export const addRule =
  <C, F extends Facts, E>(rule: Rule<C, F, E>) =>
  (ruleSet: RuleSet<C, F, E>): RuleSet<C, F, E> => ({
    ...ruleSet,
    rules: [...ruleSet.rules, rule],
  });

export const addRuleE =
  <C, F extends Facts, E>(rule: Rule<C, F, E>) =>
  (ruleSet: RuleSet<C, F, E>): P.Effect.Effect<never, E, RuleSet<C, F, E>> =>
    P.pipe(ruleSet, addRule(rule), P.Effect.succeed);

//---------------------------------------------------------------------------
export const addRuleFunc = <C, F extends Facts, E>(
  factName: keyof F,
  ruleFunc: RuleFunc<C, F>,
  note: string
): RuleSetTransform<C, F, E> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      P.Effect.succeed(facts),
      P.Effect.map(P.pipe(ruleFunc(context, facts), (value) => setFact(factName, [value, note])))
    );
  return addRule<C, F, E>({ rule, note });
};

export const addRuleFuncE = <C, F extends Facts, E>(
  factName: keyof F,
  ruleFuncE: RuleFuncE<C, F, E>,
  note: string
): RuleSetTransform<C, F, E> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      ruleFuncE(context, facts),
      P.Effect.map((value) => P.pipe(facts, setFact(factName, [value, note])))
    );

  return addRule({ rule, note });
};

//---------------------------------------------------------------------------
export const decide =
  <C, F extends Facts, E>(context: C) =>
  (ruleSet: RuleSet<C, F, E>): P.Effect.Effect<never, E, F> =>
    P.pipe(
      ruleSet.rules,
      P.Effect.reduce(ruleSet.facts, (facts, rule) => rule.rule(context, facts))
    );
