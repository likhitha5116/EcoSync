const normalize = (text) => {
  return String(text || "").trim().toLowerCase();
};


// Calculate match score
const calculateMatchScore = (waste, requirement) => {
  let score = 0;
  const reasons = [];

  const wasteType = normalize(waste.wasteType);
  const requiredWasteType = normalize(requirement.wasteType);

  // 1. Waste Type - 30 points
  if (wasteType === requiredWasteType) {
    score += 30;
    reasons.push("Waste type matches");
  }

  // 2. Sugarcane Compatibility - 15 points
  if (
    wasteType.includes("sugarcane") &&
    requiredWasteType.includes("sugarcane")
  ) {
    score += 15;
    reasons.push("Compatible sugarcane waste");
  }

  // 3. Quantity - 20 points
  if (normalize(waste.unit) === normalize(requirement.unit)) {
    if (Number(waste.quantity) >= Number(requirement.quantity)) {
      score += 20;
      reasons.push("Required quantity available");
    } else if (Number(waste.quantity) > 0) {
      score += 10;
      reasons.push("Partial quantity available");
    }

    // 4. Unit - 5 points
    score += 5;
    reasons.push("Unit matches");
  }

  // 5. Quality - 15 points
  const qualityLevels = ["low", "medium", "high"];

  const wasteQuality = qualityLevels.indexOf(
    normalize(waste.quality)
  );

  const requiredQuality = qualityLevels.indexOf(
    normalize(requirement.minimumQuality)
  );

  if (
    wasteQuality !== -1 &&
    requiredQuality !== -1
  ) {
    if (wasteQuality >= requiredQuality) {
      score += 15;
      reasons.push("Quality requirement satisfied");
    } else {
      score += 7;
      reasons.push("Quality partially matches");
    }
  }

  // 6. Location - 10 points
  if (
    normalize(waste.location) ===
    normalize(requirement.location)
  ) {
    score += 10;
    reasons.push("Same location");
  } else {
    reasons.push("Different location");
  }

  // 7. Industry Type - 5 points
  if (
    normalize(waste.industryType) ===
    normalize(requirement.industryType)
  ) {
    score += 5;
    reasons.push("Industry type matches");
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
};


// Find all suitable matches
const findMatches = (factories, requirements) => {
  const matches = [];

  requirements.forEach((requirement) => {
    factories.forEach((factory) => {

      const result = calculateMatchScore(
        factory,
        requirement
      );

      // Only show meaningful matches
      if (result.score >= 50) {
        matches.push({
          factory,
          requirement,
          matchScore: result.score,
          reasons: result.reasons,
        });
      }
    });
  });

  return matches.sort(
    (a, b) => b.matchScore - a.matchScore
  );
};


module.exports = {
  calculateMatchScore,
  findMatches,
};