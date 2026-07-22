from typing import Optional, List
from pydantic import BaseModel, Field

class MemberMedicalProfile(BaseModel):
    has_heart_disease: bool = False
    has_asthma: bool = False
    has_diabetes: bool = False
    has_high_bp: bool = False
    has_arthritis: bool = False
    is_pregnant: bool = False
    uses_wheelchair: bool = False
    no_medical_issues: bool = True

class Member(BaseModel):
    id: Optional[str] = None
    name: str
    age: int = Field(..., ge=0, le=120)
    gender: str = "Unspecified"
    walking_ability: str = "Normal" # Normal, Limited, Minimal, Wheelchair
    medical_profile: MemberMedicalProfile = Field(default_factory=MemberMedicalProfile)
    special_notes: Optional[str] = ""

class MemberCreate(BaseModel):
    name: str
    age: int
    gender: str = "Other"
    walking_ability: str = "Normal"
    has_heart_disease: bool = False
    has_asthma: bool = False
    has_diabetes: bool = False
    has_high_bp: bool = False
    has_arthritis: bool = False
    is_pregnant: bool = False
    uses_wheelchair: bool = False
    no_medical_issues: bool = True
