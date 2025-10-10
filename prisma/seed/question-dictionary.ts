import { PrismaClient, DataSource } from "@prisma/client";

const entries = [
  {
    key: "tech.inventorName",
    label: "Inventor Name",
    helpText: "Primary inventor associated with this technology.",
    bindingPath: "technology.inventorName",
    dataSource: DataSource.TECHNOLOGY,
  },
  {
    key: "tech.reviewerName",
    label: "Reviewer",
    helpText: "Technology reviewer responsible for evaluation.",
    bindingPath: "technology.reviewerName",
    dataSource: DataSource.TECHNOLOGY,
  },
  {
    key: "triage.technologyOverview",
    label: "Technology Overview",
    helpText: "Summary provided during triage stage.",
    bindingPath: "triageStage.technologyOverview",
    dataSource: DataSource.STAGE_SUPPLEMENT,
  },
  {
    key: "triage.missionAlignmentText",
    label: "Mission Alignment",
    helpText: "Narrative for mission alignment in triage.",
    bindingPath: "triageStage.missionAlignmentText",
    dataSource: DataSource.STAGE_SUPPLEMENT,
  },
  {
    key: "viability.technicalFeasibility",
    label: "Technical Feasibility",
    helpText: "Assessment captured during viability stage.",
    bindingPath: "viabilityStage.technicalFeasibility",
    dataSource: DataSource.STAGE_SUPPLEMENT,
  },
];

export async function seedQuestionDictionary(prisma: PrismaClient) {
  for (const entry of entries) {
    await prisma.questionDictionary.upsert({
      where: { key: entry.key },
      update: {
        label: entry.label,
        helpText: entry.helpText,
        bindingPath: entry.bindingPath,
        dataSource: entry.dataSource,
      },
      create: {
        version: "1.0.0",
        key: entry.key,
        label: entry.label,
        helpText: entry.helpText,
        bindingPath: entry.bindingPath,
        dataSource: entry.dataSource,
      },
    });
  }
}
