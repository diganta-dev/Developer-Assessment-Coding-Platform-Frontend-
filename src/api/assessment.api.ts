import apiClient from "@/lib/apiClient";
import { ICreateAssessmentPayload } from "@/types/assessment.type";

export function createAssessment(payload: ICreateAssessmentPayload) {
    return apiClient("assessment/create-assessment", {
        method: "POST",
        body: payload,
    });
}