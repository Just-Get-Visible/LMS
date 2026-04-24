export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string;
          cohort_id: string | null;
          course_id: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          is_published: boolean;
          live_session_id: string | null;
          published_at: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          cohort_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_published?: boolean;
          live_session_id?: string | null;
          published_at?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          cohort_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_published?: boolean;
          live_session_id?: string | null;
          published_at?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignment_submissions: {
        Row: {
          assignment_id: string;
          created_at: string;
          feedback: string | null;
          file_url: string | null;
          id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          score: number | null;
          status: Database["public"]["Enums"]["assignment_submission_status"];
          storage_bucket: string | null;
          storage_path: string | null;
          submission_json: Json | null;
          submission_text: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assignment_id: string;
          created_at?: string;
          feedback?: string | null;
          file_url?: string | null;
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          score?: number | null;
          status?: Database["public"]["Enums"]["assignment_submission_status"];
          storage_bucket?: string | null;
          storage_path?: string | null;
          submission_json?: Json | null;
          submission_text?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assignment_id?: string;
          created_at?: string;
          feedback?: string | null;
          file_url?: string | null;
          id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          score?: number | null;
          status?: Database["public"]["Enums"]["assignment_submission_status"];
          storage_bucket?: string | null;
          storage_path?: string | null;
          submission_json?: Json | null;
          submission_text?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          allow_late_submissions: boolean;
          allow_multiple_submissions: boolean;
          cohort_id: string | null;
          course_id: string;
          created_at: string;
          created_by: string | null;
          due_at: string | null;
          id: string;
          instructions: string | null;
          lesson_id: string | null;
          max_score: number | null;
          passing_score: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          allow_late_submissions?: boolean;
          allow_multiple_submissions?: boolean;
          cohort_id?: string | null;
          course_id: string;
          created_at?: string;
          created_by?: string | null;
          due_at?: string | null;
          id?: string;
          instructions?: string | null;
          lesson_id?: string | null;
          max_score?: number | null;
          passing_score?: number | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          allow_late_submissions?: boolean;
          allow_multiple_submissions?: boolean;
          cohort_id?: string | null;
          course_id?: string;
          created_at?: string;
          created_by?: string | null;
          due_at?: string | null;
          id?: string;
          instructions?: string | null;
          lesson_id?: string | null;
          max_score?: number | null;
          passing_score?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          certificate_number: string | null;
          certificate_url: string | null;
          cohort_id: string | null;
          course_id: string;
          id: string;
          issued_at: string;
          metadata: Json;
          user_id: string;
        };
        Insert: {
          certificate_number?: string | null;
          certificate_url?: string | null;
          cohort_id?: string | null;
          course_id: string;
          id?: string;
          issued_at?: string;
          metadata?: Json;
          user_id: string;
        };
        Update: {
          certificate_number?: string | null;
          certificate_url?: string | null;
          cohort_id?: string | null;
          course_id?: string;
          id?: string;
          issued_at?: string;
          metadata?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      cohort_enrolments: {
        Row: {
          activated_at: string | null;
          attendance_score: number | null;
          cohort_id: string;
          completed_at: string | null;
          engagement_score: number | null;
          enrolled_at: string;
          expires_at: string | null;
          id: string;
          metadata: Json;
          notes: string | null;
          status: Database["public"]["Enums"]["enrolment_status"];
          user_id: string;
        };
        Insert: {
          activated_at?: string | null;
          attendance_score?: number | null;
          cohort_id: string;
          completed_at?: string | null;
          engagement_score?: number | null;
          enrolled_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json;
          notes?: string | null;
          status?: Database["public"]["Enums"]["enrolment_status"];
          user_id: string;
        };
        Update: {
          activated_at?: string | null;
          attendance_score?: number | null;
          cohort_id?: string;
          completed_at?: string | null;
          engagement_score?: number | null;
          enrolled_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json;
          notes?: string | null;
          status?: Database["public"]["Enums"]["enrolment_status"];
          user_id?: string;
        };
        Relationships: [];
      };
      cohort_instructors: {
        Row: {
          cohort_id: string;
          created_at: string;
          id: string;
          role: string | null;
          user_id: string;
        };
        Insert: {
          cohort_id: string;
          created_at?: string;
          id?: string;
          role?: string | null;
          user_id: string;
        };
        Update: {
          cohort_id?: string;
          created_at?: string;
          id?: string;
          role?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      cohorts: {
        Row: {
          capacity: number | null;
          community_enabled: boolean;
          course_id: string;
          created_at: string;
          created_by: string | null;
          currency_code: string | null;
          description: string | null;
          ends_at: string | null;
          enrolment_closes_at: string | null;
          enrolment_opens_at: string | null;
          id: string;
          live_session_frequency: string | null;
          name: string;
          organisation_id: string | null;
          price_amount: number | null;
          slug: string;
          starts_at: string | null;
          status: Database["public"]["Enums"]["cohort_status"];
          timezone: string | null;
          updated_at: string;
          waitlist_enabled: boolean;
        };
        Insert: {
          capacity?: number | null;
          community_enabled?: boolean;
          course_id: string;
          created_at?: string;
          created_by?: string | null;
          currency_code?: string | null;
          description?: string | null;
          ends_at?: string | null;
          enrolment_closes_at?: string | null;
          enrolment_opens_at?: string | null;
          id?: string;
          live_session_frequency?: string | null;
          name: string;
          organisation_id?: string | null;
          price_amount?: number | null;
          slug: string;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["cohort_status"];
          timezone?: string | null;
          updated_at?: string;
          waitlist_enabled?: boolean;
        };
        Update: {
          capacity?: number | null;
          community_enabled?: boolean;
          course_id?: string;
          created_at?: string;
          created_by?: string | null;
          currency_code?: string | null;
          description?: string | null;
          ends_at?: string | null;
          enrolment_closes_at?: string | null;
          enrolment_opens_at?: string | null;
          id?: string;
          live_session_frequency?: string | null;
          name?: string;
          organisation_id?: string | null;
          price_amount?: number | null;
          slug?: string;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["cohort_status"];
          timezone?: string | null;
          updated_at?: string;
          waitlist_enabled?: boolean;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          code: string;
          coupon_type: Database["public"]["Enums"]["coupon_type"];
          created_at: string;
          created_by: string | null;
          currency_code: string | null;
          description: string | null;
          ends_at: string | null;
          id: string;
          is_active: boolean;
          max_uses: number | null;
          starts_at: string | null;
          used_count: number;
          value_amount: number;
        };
        Insert: {
          code: string;
          coupon_type: Database["public"]["Enums"]["coupon_type"];
          created_at?: string;
          created_by?: string | null;
          currency_code?: string | null;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number | null;
          starts_at?: string | null;
          used_count?: number;
          value_amount: number;
        };
        Update: {
          code?: string;
          coupon_type?: Database["public"]["Enums"]["coupon_type"];
          created_at?: string;
          created_by?: string | null;
          currency_code?: string | null;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_uses?: number | null;
          starts_at?: string | null;
          used_count?: number;
          value_amount?: number;
        };
        Relationships: [];
      };
      course_enrolments: {
        Row: {
          activated_at: string | null;
          completed_at: string | null;
          course_id: string;
          enrolled_at: string;
          expires_at: string | null;
          id: string;
          metadata: Json;
          order_id: string | null;
          source: string | null;
          status: Database["public"]["Enums"]["enrolment_status"];
          user_id: string;
        };
        Insert: {
          activated_at?: string | null;
          completed_at?: string | null;
          course_id: string;
          enrolled_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json;
          order_id?: string | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["enrolment_status"];
          user_id: string;
        };
        Update: {
          activated_at?: string | null;
          completed_at?: string | null;
          course_id?: string;
          enrolled_at?: string;
          expires_at?: string | null;
          id?: string;
          metadata?: Json;
          order_id?: string | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["enrolment_status"];
          user_id?: string;
        };
        Relationships: [];
      };
      course_instructors: {
        Row: {
          course_id: string;
          created_at: string;
          id: string;
          is_primary: boolean;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          user_id: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      course_modules: {
        Row: {
          course_id: string;
          created_at: string;
          description: string | null;
          drip_days: number | null;
          estimated_duration_minutes: number | null;
          id: string;
          is_published: boolean;
          sort_order: number;
          title: string;
          unlock_at: string | null;
          updated_at: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          description?: string | null;
          drip_days?: number | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          is_published?: boolean;
          sort_order?: number;
          title: string;
          unlock_at?: string | null;
          updated_at?: string;
        };
        Update: {
          course_id?: string;
          created_at?: string;
          description?: string | null;
          drip_days?: number | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          is_published?: boolean;
          sort_order?: number;
          title?: string;
          unlock_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_progress: {
        Row: {
          completed_at: string | null;
          completed_lessons_count: number;
          course_id: string;
          created_at: string;
          id: string;
          last_activity_at: string | null;
          progress_percent: number;
          started_at: string | null;
          total_lessons_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          completed_lessons_count?: number;
          course_id: string;
          created_at?: string;
          id?: string;
          last_activity_at?: string | null;
          progress_percent?: number;
          started_at?: string | null;
          total_lessons_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          completed_lessons_count?: number;
          course_id?: string;
          created_at?: string;
          id?: string;
          last_activity_at?: string | null;
          progress_percent?: number;
          started_at?: string | null;
          total_lessons_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          allow_comments: boolean;
          allow_discussions: boolean;
          archived_at: string | null;
          certificate_enabled: boolean;
          created_at: string;
          created_by: string | null;
          currency_code: string | null;
          delivery_type: Database["public"]["Enums"]["course_delivery_type"];
          description: string | null;
          difficulty_level: string | null;
          estimated_duration_hours: number | null;
          featured_image_url: string | null;
          id: string;
          instructor_user_id: string | null;
          intro_video_url: string | null;
          is_free: boolean;
          language_code: string | null;
          metadata: Json;
          organisation_id: string | null;
          price_amount: number | null;
          published_at: string | null;
          short_description: string | null;
          slug: string;
          sort_order: number;
          subtitle: string | null;
          tags: string[];
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          visibility: Database["public"]["Enums"]["course_visibility"];
        };
        Insert: {
          allow_comments?: boolean;
          allow_discussions?: boolean;
          archived_at?: string | null;
          certificate_enabled?: boolean;
          created_at?: string;
          created_by?: string | null;
          currency_code?: string | null;
          delivery_type?: Database["public"]["Enums"]["course_delivery_type"];
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_hours?: number | null;
          featured_image_url?: string | null;
          id?: string;
          instructor_user_id?: string | null;
          intro_video_url?: string | null;
          is_free?: boolean;
          language_code?: string | null;
          metadata?: Json;
          organisation_id?: string | null;
          price_amount?: number | null;
          published_at?: string | null;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          subtitle?: string | null;
          tags?: string[];
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["course_visibility"];
        };
        Update: {
          allow_comments?: boolean;
          allow_discussions?: boolean;
          archived_at?: string | null;
          certificate_enabled?: boolean;
          created_at?: string;
          created_by?: string | null;
          currency_code?: string | null;
          delivery_type?: Database["public"]["Enums"]["course_delivery_type"];
          description?: string | null;
          difficulty_level?: string | null;
          estimated_duration_hours?: number | null;
          featured_image_url?: string | null;
          id?: string;
          instructor_user_id?: string | null;
          intro_video_url?: string | null;
          is_free?: boolean;
          language_code?: string | null;
          metadata?: Json;
          organisation_id?: string | null;
          price_amount?: number | null;
          published_at?: string | null;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          subtitle?: string | null;
          tags?: string[];
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["course_visibility"];
        };
        Relationships: [];
      };
      discussion_posts: {
        Row: {
          author_user_id: string;
          body: string;
          created_at: string;
          id: string;
          is_edited: boolean;
          parent_post_id: string | null;
          thread_id: string;
          updated_at: string;
        };
        Insert: {
          author_user_id: string;
          body: string;
          created_at?: string;
          id?: string;
          is_edited?: boolean;
          parent_post_id?: string | null;
          thread_id: string;
          updated_at?: string;
        };
        Update: {
          author_user_id?: string;
          body?: string;
          created_at?: string;
          id?: string;
          is_edited?: boolean;
          parent_post_id?: string | null;
          thread_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      discussion_threads: {
        Row: {
          body: string | null;
          cohort_id: string | null;
          course_id: string | null;
          created_at: string;
          created_by: string;
          id: string;
          is_locked: boolean;
          is_pinned: boolean;
          lesson_id: string | null;
          live_session_id: string | null;
          scope: Database["public"]["Enums"]["discussion_scope"];
          title: string;
          updated_at: string;
        };
        Insert: {
          body?: string | null;
          cohort_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          created_by: string;
          id?: string;
          is_locked?: boolean;
          is_pinned?: boolean;
          lesson_id?: string | null;
          live_session_id?: string | null;
          scope: Database["public"]["Enums"]["discussion_scope"];
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string | null;
          cohort_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          created_by?: string;
          id?: string;
          is_locked?: boolean;
          is_pinned?: boolean;
          lesson_id?: string | null;
          live_session_id?: string | null;
          scope?: Database["public"]["Enums"]["discussion_scope"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          completed_at: string | null;
          course_id: string;
          created_at: string;
          id: string;
          is_completed: boolean;
          last_position_seconds: number | null;
          last_viewed_at: string | null;
          lesson_id: string;
          progress_percent: number | null;
          started_at: string | null;
          updated_at: string;
          user_id: string;
          watch_seconds: number | null;
        };
        Insert: {
          completed_at?: string | null;
          course_id: string;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          last_position_seconds?: number | null;
          last_viewed_at?: string | null;
          lesson_id: string;
          progress_percent?: number | null;
          started_at?: string | null;
          updated_at?: string;
          user_id: string;
          watch_seconds?: number | null;
        };
        Update: {
          completed_at?: string | null;
          course_id?: string;
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          last_position_seconds?: number | null;
          last_viewed_at?: string | null;
          lesson_id?: string;
          progress_percent?: number | null;
          started_at?: string | null;
          updated_at?: string;
          user_id?: string;
          watch_seconds?: number | null;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          content_html: string | null;
          content_json: Json | null;
          course_id: string;
          created_at: string;
          created_by: string | null;
          drip_days: number | null;
          estimated_duration_minutes: number | null;
          excerpt: string | null;
          id: string;
          is_preview: boolean;
          is_published: boolean;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          metadata: Json;
          module_id: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string | null;
          sort_order: number;
          summary: string | null;
          title: string;
          transcript: string | null;
          unlock_at: string | null;
          updated_at: string;
          video_duration_seconds: number | null;
          video_url: string | null;
        };
        Insert: {
          content_html?: string | null;
          content_json?: Json | null;
          course_id: string;
          created_at?: string;
          created_by?: string | null;
          drip_days?: number | null;
          estimated_duration_minutes?: number | null;
          excerpt?: string | null;
          id?: string;
          is_preview?: boolean;
          is_published?: boolean;
          lesson_type: Database["public"]["Enums"]["lesson_type"];
          metadata?: Json;
          module_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          sort_order?: number;
          summary?: string | null;
          title: string;
          transcript?: string | null;
          unlock_at?: string | null;
          updated_at?: string;
          video_duration_seconds?: number | null;
          video_url?: string | null;
        };
        Update: {
          content_html?: string | null;
          content_json?: Json | null;
          course_id?: string;
          created_at?: string;
          created_by?: string | null;
          drip_days?: number | null;
          estimated_duration_minutes?: number | null;
          excerpt?: string | null;
          id?: string;
          is_preview?: boolean;
          is_published?: boolean;
          lesson_type?: Database["public"]["Enums"]["lesson_type"];
          metadata?: Json;
          module_id?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string | null;
          sort_order?: number;
          summary?: string | null;
          title?: string;
          transcript?: string | null;
          unlock_at?: string | null;
          updated_at?: string;
          video_duration_seconds?: number | null;
          video_url?: string | null;
        };
        Relationships: [];
      };
      live_sessions: {
        Row: {
          actual_end_at: string | null;
          actual_start_at: string | null;
          cohort_id: string | null;
          course_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          external_meeting_id: string | null;
          host_user_id: string | null;
          id: string;
          is_recorded: boolean;
          join_url: string | null;
          lesson_id: string | null;
          max_attendees: number | null;
          metadata: Json;
          provider: string | null;
          replay_url: string | null;
          scheduled_end_at: string;
          scheduled_start_at: string;
          status: Database["public"]["Enums"]["session_status"];
          timezone: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          actual_end_at?: string | null;
          actual_start_at?: string | null;
          cohort_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          external_meeting_id?: string | null;
          host_user_id?: string | null;
          id?: string;
          is_recorded?: boolean;
          join_url?: string | null;
          lesson_id?: string | null;
          max_attendees?: number | null;
          metadata?: Json;
          provider?: string | null;
          replay_url?: string | null;
          scheduled_end_at: string;
          scheduled_start_at: string;
          status?: Database["public"]["Enums"]["session_status"];
          timezone?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          actual_end_at?: string | null;
          actual_start_at?: string | null;
          cohort_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          external_meeting_id?: string | null;
          host_user_id?: string | null;
          id?: string;
          is_recorded?: boolean;
          join_url?: string | null;
          lesson_id?: string | null;
          max_attendees?: number | null;
          metadata?: Json;
          provider?: string | null;
          replay_url?: string | null;
          scheduled_end_at?: string;
          scheduled_start_at?: string;
          status?: Database["public"]["Enums"]["session_status"];
          timezone?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          link_url: string | null;
          metadata: Json;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link_url?: string | null;
          metadata?: Json;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link_url?: string | null;
          metadata?: Json;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          billing_country_code: string | null;
          billing_email: string | null;
          billing_name: string | null;
          cohort_id: string | null;
          coupon_id: string | null;
          course_id: string | null;
          created_at: string;
          currency_code: string;
          discount_amount: number;
          id: string;
          metadata: Json;
          order_number: string;
          paid_at: string | null;
          payment_provider: Database["public"]["Enums"]["payment_provider"] | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          provider_reference: string | null;
          refunded_at: string | null;
          subtotal_amount: number;
          tax_amount: number;
          total_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          billing_country_code?: string | null;
          billing_email?: string | null;
          billing_name?: string | null;
          cohort_id?: string | null;
          coupon_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          currency_code?: string;
          discount_amount?: number;
          id?: string;
          metadata?: Json;
          order_number: string;
          paid_at?: string | null;
          payment_provider?: Database["public"]["Enums"]["payment_provider"] | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          provider_reference?: string | null;
          refunded_at?: string | null;
          subtotal_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          billing_country_code?: string | null;
          billing_email?: string | null;
          billing_name?: string | null;
          cohort_id?: string | null;
          coupon_id?: string | null;
          course_id?: string | null;
          created_at?: string;
          currency_code?: string;
          discount_amount?: number;
          id?: string;
          metadata?: Json;
          order_number?: string;
          paid_at?: string | null;
          payment_provider?: Database["public"]["Enums"]["payment_provider"] | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          provider_reference?: string | null;
          refunded_at?: string | null;
          subtotal_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      organisation_members: {
        Row: {
          created_at: string;
          id: string;
          organisation_id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organisation_id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organisation_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      organisations: {
        Row: {
          created_at: string;
          created_by: string | null;
          default_timezone: string | null;
          id: string;
          is_active: boolean;
          legal_name: string | null;
          logo_url: string | null;
          name: string;
          settings: Json;
          slug: string;
          support_email: string | null;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          default_timezone?: string | null;
          id?: string;
          is_active?: boolean;
          legal_name?: string | null;
          logo_url?: string | null;
          name: string;
          settings?: Json;
          slug: string;
          support_email?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          default_timezone?: string | null;
          id?: string;
          is_active?: boolean;
          legal_name?: string | null;
          logo_url?: string | null;
          name?: string;
          settings?: Json;
          slug?: string;
          support_email?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          order_id: string;
          payload: Json;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_event_id: string | null;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          order_id: string;
          payload?: Json;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_event_id?: string | null;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          order_id?: string;
          payload?: Json;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_event_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          country_code: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          full_name: string | null;
          headline: string | null;
          id: string;
          is_active: boolean;
          last_name: string | null;
          last_seen_at: string | null;
          metadata: Json;
          phone: string | null;
          timezone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          country_code?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          headline?: string | null;
          id: string;
          is_active?: boolean;
          last_name?: string | null;
          last_seen_at?: string | null;
          metadata?: Json;
          phone?: string | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          country_code?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          full_name?: string | null;
          headline?: string | null;
          id?: string;
          is_active?: boolean;
          last_name?: string | null;
          last_seen_at?: string | null;
          metadata?: Json;
          phone?: string | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          answers_json: Json;
          created_at: string;
          id: string;
          passed: boolean | null;
          quiz_id: string;
          score: number | null;
          score_percent: number | null;
          started_at: string;
          submitted_at: string | null;
          user_id: string;
        };
        Insert: {
          answers_json?: Json;
          created_at?: string;
          id?: string;
          passed?: boolean | null;
          quiz_id: string;
          score?: number | null;
          score_percent?: number | null;
          started_at?: string;
          submitted_at?: string | null;
          user_id: string;
        };
        Update: {
          answers_json?: Json;
          created_at?: string;
          id?: string;
          passed?: boolean | null;
          quiz_id?: string;
          score?: number | null;
          score_percent?: number | null;
          started_at?: string;
          submitted_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      quiz_question_options: {
        Row: {
          created_at: string;
          id: string;
          is_correct: boolean;
          option_text: string;
          question_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          option_text: string;
          question_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_correct?: boolean;
          option_text?: string;
          question_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          created_at: string;
          explanation: string | null;
          id: string;
          points: number;
          question_text: string;
          question_type: string;
          quiz_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          explanation?: string | null;
          id?: string;
          points?: number;
          question_text: string;
          question_type?: string;
          quiz_id: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          explanation?: string | null;
          id?: string;
          points?: number;
          question_text?: string;
          question_type?: string;
          quiz_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          attempts_allowed: number | null;
          course_id: string;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          lesson_id: string | null;
          pass_percent: number | null;
          randomize_questions: boolean;
          show_results_immediately: boolean;
          time_limit_minutes: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          attempts_allowed?: number | null;
          course_id: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          lesson_id?: string | null;
          pass_percent?: number | null;
          randomize_questions?: boolean;
          show_results_immediately?: boolean;
          time_limit_minutes?: number | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          attempts_allowed?: number | null;
          course_id?: string;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          lesson_id?: string | null;
          pass_percent?: number | null;
          randomize_questions?: boolean;
          show_results_immediately?: boolean;
          time_limit_minutes?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          course_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          external_url: string | null;
          file_name: string | null;
          file_size_bytes: number | null;
          id: string;
          is_downloadable: boolean;
          is_public: boolean;
          lesson_id: string | null;
          metadata: Json;
          mime_type: string | null;
          module_id: string | null;
          organisation_id: string | null;
          public_url: string | null;
          resource_type: Database["public"]["Enums"]["resource_type"];
          sort_order: number;
          storage_bucket: string | null;
          storage_path: string | null;
          title: string;
          updated_at: string;
          version_label: string | null;
        };
        Insert: {
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          external_url?: string | null;
          file_name?: string | null;
          file_size_bytes?: number | null;
          id?: string;
          is_downloadable?: boolean;
          is_public?: boolean;
          lesson_id?: string | null;
          metadata?: Json;
          mime_type?: string | null;
          module_id?: string | null;
          organisation_id?: string | null;
          public_url?: string | null;
          resource_type: Database["public"]["Enums"]["resource_type"];
          sort_order?: number;
          storage_bucket?: string | null;
          storage_path?: string | null;
          title: string;
          updated_at?: string;
          version_label?: string | null;
        };
        Update: {
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          external_url?: string | null;
          file_name?: string | null;
          file_size_bytes?: number | null;
          id?: string;
          is_downloadable?: boolean;
          is_public?: boolean;
          lesson_id?: string | null;
          metadata?: Json;
          mime_type?: string | null;
          module_id?: string | null;
          organisation_id?: string | null;
          public_url?: string | null;
          resource_type?: Database["public"]["Enums"]["resource_type"];
          sort_order?: number;
          storage_bucket?: string | null;
          storage_path?: string | null;
          title?: string;
          updated_at?: string;
          version_label?: string | null;
        };
        Relationships: [];
      };
      session_attendance: {
        Row: {
          created_at: string;
          duration_minutes: number | null;
          id: string;
          joined_at: string | null;
          left_at: string | null;
          live_session_id: string;
          notes: string | null;
          status: Database["public"]["Enums"]["attendance_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          joined_at?: string | null;
          left_at?: string | null;
          live_session_id: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          joined_at?: string | null;
          left_at?: string | null;
          live_session_id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["attendance_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: {
        Args: { _user_id: string };
        Returns: boolean;
      };
      is_instructor: {
        Args: { _user_id: string };
        Returns: boolean;
      };
      user_can_access_course: {
        Args: { _user_id: string; _course_id: string };
        Returns: boolean;
      };
      user_can_access_cohort: {
        Args: { _user_id: string; _cohort_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "instructor" | "student" | "staff";
      assignment_submission_status:
        | "draft"
        | "submitted"
        | "reviewed"
        | "returned"
        | "passed"
        | "failed";
      attendance_status: "registered" | "attended" | "missed" | "late" | "excused";
      cohort_status:
        | "draft"
        | "open"
        | "closed"
        | "running"
        | "completed"
        | "cancelled";
      coupon_type: "percentage" | "fixed_amount";
      course_delivery_type: "self_paced" | "cohort" | "hybrid";
      course_visibility: "draft" | "private" | "public" | "archived";
      discussion_scope: "course" | "cohort" | "lesson" | "session";
      enrolment_status:
        | "pending"
        | "active"
        | "cancelled"
        | "completed"
        | "refunded"
        | "expired";
      lesson_type:
        | "video"
        | "text"
        | "document"
        | "live_session"
        | "quiz"
        | "assignment";
      payment_provider: "stripe" | "paypal" | "manual" | "other";
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "cancelled";
      resource_type:
        | "pdf"
        | "doc"
        | "sheet"
        | "slide"
        | "zip"
        | "link"
        | "template"
        | "image"
        | "video"
        | "other";
      session_status: "scheduled" | "live" | "completed" | "cancelled";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
