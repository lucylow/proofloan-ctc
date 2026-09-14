import type {
  DemoApplication,
  DemoPortfolio,
} from "../types";

export function createDemoPortfolio(
  applications: DemoApplication[],
): DemoPortfolio {
  const activeApplications =
    applications.filter(
      application =>
        ![
          "Rejected",
          "Executed",
        ].includes(application.state),
    ).length;

  const executedLoans =
    applications.filter(
      application =>
        application.state === "Executed",
    ).length;

  const totalRequested =
    applications.reduce(
      (total, application) =>
        total + application.amount,
      0,
    );

  const totalExecuted =
    applications
      .filter(
        application =>
          application.state === "Executed",
      )
      .reduce(
        (total, application) =>
          total + application.amount,
        0,
      );

  const averageConfidence =
    applications.length === 0
      ? 0
      : Math.round(
          applications.reduce(
            (total, application) =>
              total + application.confidence,
            0,
          ) / applications.length,
        );

  return {
    totalApplications:
      applications.length,
    activeApplications,
    executedLoans,
    totalRequested,
    totalExecuted,
    availableCapacity: 8500,
    averageRiskTier: "B",
    averageConfidence,
  };
}
