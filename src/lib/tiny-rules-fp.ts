import * as P from '@konker.dev/effect-ts-prelude';

export type Fact = [boolean, string];
export type Facts = Record<string, Fact>;

export const val = (fact: Fact): boolean => fact[0];
export const note = (fact: Fact): string => fact[1];

//---------------------------------------------------------------------------
export type Rule<C, F extends Facts> = {
  readonly rule: (context: C, facts: F) => P.Effect.Effect<never, Error, F>;
  readonly note: string;
};

export type RuleSet<C, F extends Facts> = {
  readonly facts: F;
  readonly rules: Array<Rule<C, F>>;
};

export type RuleSetTransform<C, F extends Facts> = (ruleSet: RuleSet<C, F>) => RuleSet<C, F>;

export type RuleFunc<C, F extends Facts> = (context: C, facts: F) => boolean;

export type RuleFuncE<C, F extends Facts> = (context: C, facts: F) => P.Effect.Effect<never, Error, boolean>;

//---------------------------------------------------------------------------
export const createRuleSet = <C, F extends Facts>(initialFacts: F): RuleSet<C, F> => ({
  facts: initialFacts,
  rules: [],
});

export const createRuleSetE = <C, F extends Facts>(initialFacts: F): P.Effect.Effect<never, Error, RuleSet<C, F>> =>
  P.Effect.succeed(createRuleSet(initialFacts));

export const setFacts = <C, F extends Facts>(ruleSet: RuleSet<C, F>, facts: F): RuleSet<C, F> => ({
  ...ruleSet,
  facts,
});

export const sequence =
  <C, F extends Facts>(rulesList: ReadonlyArray<RuleSetTransform<C, F>>) =>
  (ruleSet: RuleSet<C, F>): RuleSet<C, F> => {
    return rulesList.reduce((acc, ruleTransform) => ruleTransform(acc), ruleSet);
  };

//---------------------------------------------------------------------------
export const setFactsE = <C, F extends Facts>(
  ruleSet: RuleSet<C, F>,
  facts: F
): P.Effect.Effect<never, Error, RuleSet<C, F>> => P.Effect.succeed(setFacts(ruleSet, facts));

export const setFact =
  <F extends Facts>(key: keyof F, value: [boolean, string]) =>
  (facts: F): F => ({ ...facts, [key]: value });

export const setFactE =
  <F extends Facts>(key: keyof F, value: [boolean, string]) =>
  (facts: F): P.Effect.Effect<never, Error, F> =>
    P.pipe(facts, setFact(key, value), P.Effect.succeed);

//---------------------------------------------------------------------------
export const addRule =
  <C, F extends Facts>(rule: Rule<C, F>) =>
  (ruleSet: RuleSet<C, F>): RuleSet<C, F> => ({
    ...ruleSet,
    rules: [...ruleSet.rules, rule],
  });

export const addRuleE =
  <C, F extends Facts>(rule: Rule<C, F>) =>
  (ruleSet: RuleSet<C, F>): P.Effect.Effect<never, Error, RuleSet<C, F>> =>
    P.pipe(ruleSet, addRule(rule), P.Effect.succeed);

//---------------------------------------------------------------------------
export const addRuleFunc = <C, F extends Facts>(
  factName: keyof F,
  ruleFunc: RuleFunc<C, F>,
  note: string
): RuleSetTransform<C, F> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      P.Effect.succeed(facts),
      P.Effect.map(P.pipe(ruleFunc(context, facts), (value) => setFact(factName, [value, note])))
    );
  return addRule({ rule, note });
};

export const addRuleFuncE = <C, F extends Facts>(
  factName: keyof F,
  ruleFuncE: RuleFuncE<C, F>,
  note: string
): RuleSetTransform<C, F> => {
  const rule = (context: C, facts: F) =>
    P.pipe(
      ruleFuncE(context, facts),
      P.Effect.map((value) => P.pipe(facts, setFact(factName, [value, note])))
    );

  return addRule({ rule, note });
};

//---------------------------------------------------------------------------
export const decide =
  <C, F extends Facts>(context: C) =>
  (ruleSet: RuleSet<C, F>): P.Effect.Effect<never, Error, RuleSet<C, F>> =>
    P.pipe(
      ruleSet.rules,
      P.Effect.reduce(ruleSet.facts, (facts, rule) => rule.rule(context, facts)),
      P.Effect.map((facts: F) => setFacts(ruleSet, facts))
    );
