import * as P from '@konker.dev/effect-ts-prelude';

export type RulesEngine<C, F> = {
  readonly facts: F;
  readonly rules: Array<Rule<C, F>>;
};

export type Rule<C, F> = (context: C, facts: F) => P.Effect.Effect<never, Error, F>;

export const identityRule = <C, F>(_context: C, facts: F) => P.Effect.succeed(facts);

export const createRulesEngine = <C, F>(initialFacts: F): P.Effect.Effect<never, never, RulesEngine<C, F>> =>
  P.Effect.succeed({
    facts: initialFacts,
    rules: [],
  });

export const setFacts = <C, F>(rulesEngine: RulesEngine<C, F>, facts: F): RulesEngine<C, F> => ({
  ...rulesEngine,
  facts,
});

export const setFact =
  <F>(key: keyof F, value: F[keyof F]) =>
  (fact: F): P.Effect.Effect<never, never, F> =>
    P.Effect.succeed({ ...fact, [key]: value });

export const addRule =
  <C, F>(rule: Rule<C, F>) =>
  (rulesEngine: RulesEngine<C, F>): P.Effect.Effect<never, Error, RulesEngine<C, F>> =>
    P.Effect.succeed({
      ...rulesEngine,
      rules: [...rulesEngine.rules, rule],
    });

export const decide =
  <C, F>(context: C) =>
  (rulesEngine: RulesEngine<C, F>) =>
    P.pipe(
      rulesEngine.rules,
      P.Effect.reduce(rulesEngine.facts, (acc, val) => val(context, acc)),
      P.Effect.map((facts: F) => setFacts(rulesEngine, facts))
    );

export const decideEffect =
  <C, F>(context: C) =>
  (rulesEngine: P.Effect.Effect<never, Error, RulesEngine<C, F>>) =>
    P.pipe(
      rulesEngine,
      P.Effect.flatMap((rulesEngine) => P.pipe(rulesEngine, decide(context)))
    );
