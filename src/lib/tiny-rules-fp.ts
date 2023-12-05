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
export type Rule<C, E, F extends Facts> = {
  readonly rule: (context: C, facts: F) => P.Effect.Effect<never, E, F>;
  readonly note: string;
};

export type RuleSet<C, E, F extends Facts> = {
  readonly facts: F;
  readonly rules: Array<Rule<C, E, F>>;
};

export type RuleSetTransform<C, E, F extends Facts> = (ruleSet: RuleSet<C, E, F>) => RuleSet<C, E, F>;

export type RuleFunc<C, F extends Facts> = (context: C, facts: F) => boolean;

export type RuleFuncEffect<C, E, F extends Facts> = (context: C, facts: F) => P.Effect.Effect<never, E, boolean>;

//---------------------------------------------------------------------------
export const createRuleSet = <C, E, F extends Facts>(initialFacts: F): RuleSet<C, E, F> => ({
  facts: initialFacts,
  rules: [],
});

export const createRuleSetE = <C, E, F extends Facts>(initialFacts: F): P.Effect.Effect<never, E, RuleSet<C, E, F>> =>
  P.Effect.succeed(createRuleSet(initialFacts));

export const setFacts = <C, E, F extends Facts>(ruleSet: RuleSet<C, E, F>, facts: F): RuleSet<C, E, F> => ({
  ...ruleSet,
  facts,
});

export const sequence =
  <C, E, F extends Facts>(rulesList: ReadonlyArray<RuleSetTransform<C, E, F>>) =>
  (ruleSet: RuleSet<C, E, F>): RuleSet<C, E, F> => {
    return rulesList.reduce((acc, ruleTransform) => ruleTransform(acc), ruleSet);
  };

//---------------------------------------------------------------------------
export const setFactsE = <C, E, F extends Facts>(
  ruleSet: RuleSet<C, E, F>,
  facts: F
): P.Effect.Effect<never, E, RuleSet<C, E, F>> => P.Effect.succeed(setFacts(ruleSet, facts));

export const setFact =
  <F extends Facts>(key: keyof F, value: [boolean, string]) =>
  (facts: F): F => ({ ...facts, [key]: value });

export const setFactE =
  <F extends Facts, E>(key: keyof F, value: [boolean, string]) =>
  (facts: F): P.Effect.Effect<never, E, F> =>
    P.pipe(facts, setFact(key, value), P.Effect.succeed);

//---------------------------------------------------------------------------
export const addRule =
  <C, E, F extends Facts>(rule: Rule<C, E, F>) =>
  (ruleSet: RuleSet<C, E, F>): RuleSet<C, E, F> => ({
    ...ruleSet,
    rules: [...ruleSet.rules, rule],
  });

export const addRuleE =
  <C, E, F extends Facts>(rule: Rule<C, E, F>) =>
  (ruleSet: RuleSet<C, E, F>): P.Effect.Effect<never, E, RuleSet<C, E, F>> =>
    P.pipe(ruleSet, addRule(rule), P.Effect.succeed);

//---------------------------------------------------------------------------
export const addRuleFunc = <C, E, F extends Facts>(
  factName: keyof F,
  ruleFunc: RuleFunc<C, F>,
  note: string
): RuleSetTransform<C, E, F> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      P.Effect.succeed(facts),
      P.Effect.map(P.pipe(ruleFunc(context, facts), (value) => setFact(factName, [value, note])))
    );
  return addRule<C, E, F>({ rule, note });
};

export const addRuleFuncEffect = <C, E, F extends Facts>(
  factName: keyof F,
  ruleFuncEffect: RuleFuncEffect<C, E, F>,
  note: string
): RuleSetTransform<C, E, F> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      ruleFuncEffect(context, facts),
      P.Effect.map((value) => P.pipe(facts, setFact(factName, [value, note])))
    );

  return addRule({ rule, note });
};

//---------------------------------------------------------------------------
export const decide =
  <C, E, F extends Facts>(context: C) =>
  (ruleSet: RuleSet<C, E, F>): P.Effect.Effect<never, E, F> =>
    P.pipe(
      ruleSet.rules,
      P.Effect.reduce(ruleSet.facts, (facts, rule) => rule.rule(context, facts))
    );

export const overrideDecide =
  <C, E, F extends Facts>(context: C, oldFacts: F) =>
  (ruleSet: RuleSet<C, E, F>): P.Effect.Effect<never, E, F> =>
    P.pipe(setFacts(ruleSet, oldFacts), (ruleSet) =>
      P.pipe(
        ruleSet,
        (ruleSet) => ruleSet.rules,
        P.Effect.reduce(ruleSet.facts, (facts, rule) => rule.rule(context, facts))
      )
    );
