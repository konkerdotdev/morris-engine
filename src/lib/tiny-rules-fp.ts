import * as P from '@konker.dev/effect-ts-prelude';

export type RuleSet<C, F> = {
  readonly facts: F;
  readonly rules: Array<Rule<C, F>>;
};

export type RuleFunc<C, F> = (context: C, facts: F) => F[keyof F];
export type Rule<C, F> = (context: C, facts: F) => P.Effect.Effect<never, Error, F>;

export const createRuleSet = <C, F>(initialFacts: F): RuleSet<C, F> => ({
  facts: initialFacts,
  rules: [],
});

export const setFacts = <C, F>(ruleSet: RuleSet<C, F>, facts: F): RuleSet<C, F> => ({
  ...ruleSet,
  facts,
});

export const setFact =
  <F>(key: keyof F, value: F[keyof F]) =>
  (facts: F): F => ({ ...facts, [key]: value });

export const addRule =
  <C, F>(rule: Rule<C, F>) =>
  (ruleSet: RuleSet<C, F>): RuleSet<C, F> => ({
    ...ruleSet,
    rules: [...ruleSet.rules, rule],
  });

export const addRuleFunc = <C, F>(factName: keyof F, ruleFunc: RuleFunc<C, F>) => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      P.Effect.succeed(facts),
      P.Effect.map(P.pipe(ruleFunc(context, facts), (value) => setFact(factName, value)))
    );
  return addRule(rule);
};

export const decide =
  <C, F>(context: C) =>
  (ruleSet: RuleSet<C, F>): P.Effect.Effect<never, Error, RuleSet<C, F>> =>
    P.pipe(
      ruleSet.rules,
      P.Effect.reduce(ruleSet.facts, (facts, rule) => rule(context, facts)),
      P.Effect.map((facts: F) => setFacts(ruleSet, facts))
    );
