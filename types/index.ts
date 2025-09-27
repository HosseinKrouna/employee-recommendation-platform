export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  department?: string
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR = 'HR',
  ADMIN = 'ADMIN'
}

export interface Recommendation {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  position: string
  department: string
  skills: string[]
  experience: string
  notes?: string
  cvFilePath?: string
  status: RecommendationStatus
  recommendedBy: string
  recommendedByUser?: User
  createdAt: Date
  updatedAt: Date
}

export enum RecommendationStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface CreateRecommendationDto {
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  position: string
  department: string
  skills: string[]
  experience: string
  notes?: string
}