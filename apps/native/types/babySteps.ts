export type BabyStep = {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  targetAmount?: number;
  isCompleted: boolean;
};

export type BabyStepsProgress = {
  currentStep: number;
  step1Progress: number;
  step1Target: number;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Progress: number;
  step3Target: number;
  step3Completed: boolean;
  emergencyFundBalance: number;
  updatedAt: string;
};
