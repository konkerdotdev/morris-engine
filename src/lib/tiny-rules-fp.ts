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
export type Rule<R, C, E, F extends Facts> = {
  readonly rule: (context: C, facts: F) => P.Effect.Effect<R, E, F>;
  readonly note: string;
};

export type RuleSet<R, C, E, F extends Facts> = {
  readonly facts: F;
  readonly rules: Array<Rule<R, C, E, F>>;
};

export type RuleSetTransform<R, C, E, F extends Facts> = (ruleSet: RuleSet<R, C, E, F>) => RuleSet<R, C, E, F>;

export type RuleFunc<C, F extends Facts> = (context: C, facts: F) => boolean;

export type RuleFuncEffect<R, C, E, F extends Facts> = (context: C, facts: F) => P.Effect.Effect<R, E, boolean>;

//---------------------------------------------------------------------------
export const createRuleSet = <R, C, E, F extends Facts>(initialFacts: F): RuleSet<R, C, E, F> => ({
  facts: initialFacts,
  rules: [],
});

export const setFacts = <R, C, E, F extends Facts>(ruleSet: RuleSet<R, C, E, F>, facts: F): RuleSet<R, C, E, F> => ({
  ...ruleSet,
  facts,
});

export const sequence =
  <R, C, E, F extends Facts>(rulesList: ReadonlyArray<RuleSetTransform<R, C, E, F>>) =>
  (ruleSet: RuleSet<R, C, E, F>): RuleSet<R, C, E, F> => {
    return rulesList.reduce((acc, ruleTransform) => ruleTransform(acc), ruleSet);
  };

//---------------------------------------------------------------------------
export const setFact =
  <F extends Facts>(key: keyof F, value: [boolean, string]) =>
  (facts: F): F => ({ ...facts, [key]: value });

//---------------------------------------------------------------------------
export const addRule =
  <R, C, E, F extends Facts>(rule: Rule<R, C, E, F>) =>
  (ruleSet: RuleSet<R, C, E, F>): RuleSet<R, C, E, F> => ({
    ...ruleSet,
    rules: [...ruleSet.rules, rule],
  });

//---------------------------------------------------------------------------
export const addRuleFunc = <R, C, E, F extends Facts>(
  factName: keyof F,
  ruleFunc: RuleFunc<C, F>,
  note: string
): RuleSetTransform<R, C, E, F> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      P.Effect.succeed(facts),
      P.Effect.map(P.pipe(ruleFunc(context, facts), (value) => setFact(factName, [value, note])))
    );
  return addRule<R, C, E, F>({ rule, note });
};

export const addRuleFuncEffect = <R, C, E, F extends Facts>(
  factName: keyof F,
  ruleFuncEffect: RuleFuncEffect<R, C, E, F>,
  note: string
): RuleSetTransform<R, C, E, F> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      ruleFuncEffect(context, facts),
      P.Effect.map((value) => P.pipe(facts, setFact(factName, [value, note])))
    );

  return addRule({ rule, note });
};

//---------------------------------------------------------------------------
export const decide =
  <R, C, E, F extends Facts>(context: C) =>
  (ruleSet: RuleSet<R, C, E, F>): P.Effect.Effect<R, E, F> =>
    P.pipe(
      ruleSet.rules,
      P.Effect.reduce(ruleSet.facts, (facts, rule) => rule.rule(context, facts))
    );

export const overrideDecide =
  <R, C, E, F extends Facts>(context: C, oldFacts: F) =>
  (ruleSet: RuleSet<R, C, E, F>): P.Effect.Effect<R, E, F> =>
    P.pipe(setFacts(ruleSet, oldFacts), (ruleSet) =>
      P.pipe(
        ruleSet,
        (ruleSet) => ruleSet.rules,
        P.Effect.reduce(ruleSet.facts, (facts, rule) => rule.rule(context, facts))
      )
    );
