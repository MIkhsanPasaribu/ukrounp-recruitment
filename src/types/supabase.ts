export interface Database {
  public: {
    Tables: {
      applicants: {
        Row: {
          id: string;
          email: string;
          fullName: string;
          nickname: string | null;
          gender: "LAKI_LAKI" | "PEREMPUAN" | null;
          birthDate: string | null;
          faculty: string | null;
          department: string | null;
          studyProgram: string | null;
          educationLevel: "" | "S1" | "D4" | "D3" | null;
          nim: string | null;
          nia: string | null;
          previousSchool: string | null;
          padangAddress: string | null;
          phoneNumber: string | null;
          motivation: string | null;
          futurePlans: string | null;
          whyYouShouldBeAccepted: string | null;
          corelDraw: boolean;
          photoshop: boolean;
          adobePremierePro: boolean;
          adobeAfterEffect: boolean;
          autodeskEagle: boolean;
          arduinoIde: boolean;
          androidStudio: boolean;
          visualStudio: boolean;
          missionPlaner: boolean;
          autodeskInventor: boolean;
          autodeskAutocad: boolean;
          solidworks: boolean;
          otherSoftware: string | null;
          mbtiProof: string | null;
          photo: string | null;
          studentCard: string | null;
          studyPlanCard: string | null;
          igFollowProof: string | null;
          tiktokFollowProof: string | null;
          status:
            | "SEDANG_DITINJAU"
            | "DAFTAR_PENDEK"
            | "INTERVIEW"
            | "DITERIMA"
            | "DITOLAK";
          submittedAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          email: string;
          fullName: string;
          nickname?: string | null;
          gender?: "LAKI_LAKI" | "PEREMPUAN" | null;
          birthDate?: string | null;
          faculty?: string | null;
          department?: string | null;
          studyProgram?: string | null;
          educationLevel?: "" | "S1" | "D4" | "D3" | null;
          nim?: string | null;
          nia?: string | null;
          previousSchool?: string | null;
          padangAddress?: string | null;
          phoneNumber?: string | null;
          motivation?: string | null;
          futurePlans?: string | null;
          whyYouShouldBeAccepted?: string | null;
          corelDraw?: boolean;
          photoshop?: boolean;
          adobePremierePro?: boolean;
          adobeAfterEffect?: boolean;
          autodeskEagle?: boolean;
          arduinoIde?: boolean;
          androidStudio?: boolean;
          visualStudio?: boolean;
          missionPlaner?: boolean;
          autodeskInventor?: boolean;
          autodeskAutocad?: boolean;
          solidworks?: boolean;
          otherSoftware?: string | null;
          mbtiProof?: string | null;
          photo?: string | null;
          studentCard?: string | null;
          studyPlanCard?: string | null;
          igFollowProof?: string | null;
          tiktokFollowProof?: string | null;
          status?:
            | "SEDANG_DITINJAU"
            | "DAFTAR_PENDEK"
            | "INTERVIEW"
            | "DITERIMA"
            | "DITOLAK";
          submittedAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          email?: string;
          fullName?: string;
          nickname?: string | null;
          gender?: "LAKI_LAKI" | "PEREMPUAN" | null;
          birthDate?: string | null;
          faculty?: string | null;
          department?: string | null;
          studyProgram?: string | null;
          educationLevel?: "" | "S1" | "D4" | "D3" | null;
          nim?: string | null;
          nia?: string | null;
          previousSchool?: string | null;
          padangAddress?: string | null;
          phoneNumber?: string | null;
          motivation?: string | null;
          futurePlans?: string | null;
          whyYouShouldBeAccepted?: string | null;
          corelDraw?: boolean;
          photoshop?: boolean;
          adobePremierePro?: boolean;
          adobeAfterEffect?: boolean;
          autodeskEagle?: boolean;
          arduinoIde?: boolean;
          androidStudio?: boolean;
          visualStudio?: boolean;
          missionPlaner?: boolean;
          autodeskInventor?: boolean;
          autodeskAutocad?: boolean;
          solidworks?: boolean;
          otherSoftware?: string | null;
          mbtiProof?: string | null;
          photo?: string | null;
          studentCard?: string | null;
          studyPlanCard?: string | null;
          igFollowProof?: string | null;
          tiktokFollowProof?: string | null;
          status?:
            | "SEDANG_DITINJAU"
            | "DAFTAR_PENDEK"
            | "INTERVIEW"
            | "DITERIMA"
            | "DITOLAK";
          submittedAt?: string;
          updatedAt?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
  };
}

export type ApplicantRow = Database["public"]["Tables"]["applicants"]["Row"];
export type ApplicantInsert =
  Database["public"]["Tables"]["applicants"]["Insert"];
export type ApplicantUpdate =
  Database["public"]["Tables"]["applicants"]["Update"];
export type SettingsRow = Database["public"]["Tables"]["settings"]["Row"];
