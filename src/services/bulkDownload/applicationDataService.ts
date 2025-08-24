import { supabase } from "@/lib/supabase";
import { ApplicationData } from "@/types";

/**
 * Service untuk mengambil data aplikasi dari database
 */
export class ApplicationDataService {
  /**
   * Mengambil semua data aplikasi dari database
   * @param batchSize - Ukuran batch untuk pagination (opsional)
   * @returns Promise yang berisi data aplikasi
   */
  static async ambilSemuaAplikasi(
    batchSize?: number
  ): Promise<ApplicationData[]> {
    try {
      let query = supabase
        .from("applicants")
        .select("*")
        .order("submittedAt", { ascending: false });

      if (batchSize) {
        query = query.limit(batchSize);
      }

      const { data: applications, error } = await query;

      if (error) {
        console.error("Error mengambil aplikasi:", error);
        throw new Error(`Gagal mengambil aplikasi: ${error.message}`);
      }

      if (!applications || applications.length === 0) {
        return [];
      }

      // Konversi data mentah ke format ApplicationData
      return applications.map((applicantData) =>
        this.formatApplicationData(applicantData)
      );
    } catch (error) {
      console.error("Error dalam ambilSemuaAplikasi:", error);
      throw error;
    }
  }

  /**
   * Mengambil data aplikasi dengan pagination
   * @param offset - Offset untuk pagination
   * @param limit - Limit untuk pagination
   * @returns Promise yang berisi data aplikasi dan total count
   */
  static async ambilAplikasiDenganPagination(
    offset: number,
    limit: number
  ): Promise<{ applications: ApplicationData[]; totalCount: number }> {
    try {
      // Ambil total count terlebih dahulu
      const { count, error: countError } = await supabase
        .from("applicants")
        .select("*", { count: "exact", head: true });

      if (countError) {
        throw new Error(
          `Gagal mengambil jumlah aplikasi: ${countError.message}`
        );
      }

      // Ambil data dengan pagination
      const { data: applications, error } = await supabase
        .from("applicants")
        .select("*")
        .order("submittedAt", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Gagal mengambil aplikasi: ${error.message}`);
      }

      const formattedApplications =
        applications?.map((applicantData) =>
          this.formatApplicationData(applicantData)
        ) || [];

      return {
        applications: formattedApplications,
        totalCount: count || 0,
      };
    } catch (error) {
      console.error("Error dalam ambilAplikasiDenganPagination:", error);
      throw error;
    }
  }

  /**
   * Memformat data mentah dari database ke format ApplicationData
   * @param applicantData - Data mentah dari database
   * @returns Data yang sudah diformat
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static formatApplicationData(applicantData: any): ApplicationData {
    return {
      id: applicantData.id,
      email: applicantData.email || "",
      fullName: applicantData.fullName || "",
      nickname: applicantData.nickname,
      gender: applicantData.gender,
      birthDate: applicantData.birthDate,
      faculty: applicantData.faculty,
      department: applicantData.department,
      studyProgram: applicantData.studyProgram,
      nim: applicantData.nim,
      nia: applicantData.nia,
      previousSchool: applicantData.previousSchool,
      padangAddress: applicantData.padangAddress,
      phoneNumber: applicantData.phoneNumber,
      motivation: applicantData.motivation,
      futurePlans: applicantData.futurePlans,
      whyYouShouldBeAccepted: applicantData.whyYouShouldBeAccepted,
      software: {
        corelDraw: Boolean(applicantData.corelDraw),
        photoshop: Boolean(applicantData.photoshop),
        adobePremierePro: Boolean(applicantData.adobePremierePro),
        adobeAfterEffect: Boolean(applicantData.adobeAfterEffect),
        autodeskEagle: Boolean(applicantData.autodeskEagle),
        arduinoIde: Boolean(applicantData.arduinoIde),
        androidStudio: Boolean(applicantData.androidStudio),
        visualStudio: Boolean(applicantData.visualStudio),
        missionPlaner: Boolean(applicantData.missionPlaner),
        autodeskInventor: Boolean(applicantData.autodeskInventor),
        autodeskAutocad: Boolean(applicantData.autodeskAutocad),
        solidworks: Boolean(applicantData.solidworks),
        others: applicantData.otherSoftware || "",
      },
      studyPlanCard: applicantData.studyPlanCard,
      igFollowProof: applicantData.igFollowProof,
      tiktokFollowProof: applicantData.tiktokFollowProof,
      status: applicantData.status,
      submittedAt: applicantData.submittedAt,
      mbtiProof: applicantData.mbtiProof || "",
      photo: applicantData.photo || "",
    };
  }

  /**
   * Mengambil jumlah total aplikasi
   * @returns Promise yang berisi jumlah total aplikasi
   */
  static async hitungTotalAplikasi(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("applicants")
        .select("*", { count: "exact", head: true });

      if (error) {
        throw new Error(`Gagal menghitung aplikasi: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error("Error dalam hitungTotalAplikasi:", error);
      throw error;
    }
  }
}
