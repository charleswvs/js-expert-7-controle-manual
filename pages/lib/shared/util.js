function supportsWorkerType() {
  let supported = false;
  const tester = {
    get type() {
      supported = true;
    }
  };

  try {
    new Worker('blob://', tester).terminate();
  } finally {
    return supported;
  }
}

function prepareRunChecker({ timerDelay }) {
  let lastEvent = Date.now()

  return {
    shouldRun() {
      const result = (Date.now() - lastEvent) > timerDelay
      if (result) lastEvent = Date.now()

      return result
    }
  }
}

export {
  supportsWorkerType,
  prepareRunChecker
}