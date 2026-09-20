export const HINT_STAGE = { NONE: 0, SMALL: 1, BIG: 2, EXPLANATION: 3 };

export function advanceHintStage(currentStage) {
  if (currentStage < HINT_STAGE.BIG) return currentStage + 1;
  return HINT_STAGE.EXPLANATION;
}

export function createHintFlow() {
  let stage = HINT_STAGE.NONE;
  return {
    get stage() {
      return stage;
    },
    onIncorrectAnswer() {
      stage = advanceHintStage(stage);
      return stage;
    },
    requestExplanation() {
      stage = HINT_STAGE.EXPLANATION;
      return stage;
    },
    reset() {
      stage = HINT_STAGE.NONE;
    },
  };
}
