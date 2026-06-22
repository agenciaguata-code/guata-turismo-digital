export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          feedback: string | null
          file_url: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          lesson_id: string
          max_grade: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id: string
          max_grade?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string
          max_grade?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          code: string
          course_id: string
          course_title: string
          hours: number
          id: string
          issued_at: string
          student_name: string
          user_id: string
        }
        Insert: {
          code: string
          course_id: string
          course_title: string
          hours?: number
          id?: string
          issued_at?: string
          student_name: string
          user_id: string
        }
        Update: {
          code?: string
          course_id?: string
          course_title?: string
          hours?: number
          id?: string
          issued_at?: string
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          duration_hours: number
          id: string
          instructor_id: string | null
          is_published: boolean
          level: Database["public"]["Enums"]["course_level"]
          price: number
          short_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          instructor_id?: string | null
          is_published?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          price?: number
          short_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          instructor_id?: string | null
          is_published?: boolean
          level?: Database["public"]["Enums"]["course_level"]
          price?: number
          short_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          progress_pct: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress_pct?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress_pct?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          content: string
          created_at: string
          id: string
          is_resolved: boolean
          lesson_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          lesson_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          lesson_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
          watch_seconds: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
          watch_seconds?: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
          watch_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_free_preview: boolean
          module_id: string
          order_index: number
          title: string
          updated_at: string
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_free_preview?: boolean
          module_id: string
          order_index?: number
          title: string
          updated_at?: string
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_free_preview?: boolean
          module_id?: string
          order_index?: number
          title?: string
          updated_at?: string
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          course_id: string | null
          created_at: string
          file_url: string
          id: string
          lesson_id: string | null
          material_type: Database["public"]["Enums"]["material_type"]
          size_kb: number | null
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          file_url: string
          id?: string
          lesson_id?: string | null
          material_type?: Database["public"]["Enums"]["material_type"]
          size_kb?: number | null
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
          material_type?: Database["public"]["Enums"]["material_type"]
          size_kb?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          must_change_password: boolean
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          must_change_password?: boolean
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          must_change_password?: boolean
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          finished_at: string | null
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          finished_at?: string | null
          id?: string
          passed?: boolean
          quiz_id: string
          score?: number
          started_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          finished_at?: string | null
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          id: string
          options: Json | null
          order_index: number
          points: number
          question: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lesson_id: string | null
          max_attempts: number
          module_id: string | null
          passing_score: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number
          module_id?: string | null
          passing_score?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lesson_id?: string | null
          max_attempts?: number
          module_id?: string | null
          passing_score?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_certificate: {
        Args: { _code: string }
        Returns: {
          code: string
          course_title: string
          hours: number
          issued_at: string
          student_name: string
        }[]
      }
    }
    Enums: {
      app_role: "aluno" | "professor" | "admin"
      course_level: "iniciante" | "intermediario" | "avancado"
      material_type:
        | "pdf"
        | "slide"
        | "documento"
        | "planilha"
        | "link"
        | "outro"
      question_type: "multipla_escolha" | "verdadeiro_falso" | "dissertativa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["aluno", "professor", "admin"],
      course_level: ["iniciante", "intermediario", "avancado"],
      material_type: ["pdf", "slide", "documento", "planilha", "link", "outro"],
      question_type: ["multipla_escolha", "verdadeiro_falso", "dissertativa"],
    },
  },
} as const
