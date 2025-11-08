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
    PostgrestVersion: "13.0.5"
  }
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          last_webauthn_challenge_data: Json | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          last_webauthn_challenge_data?: Json | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_authorizations: {
        Row: {
          approved_at: string | null
          authorization_code: string | null
          authorization_id: string
          client_id: string
          code_challenge: string | null
          code_challenge_method:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at: string
          expires_at: string
          id: string
          redirect_uri: string
          resource: string | null
          response_type: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state: string | null
          status: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id: string
          client_id: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id: string
          redirect_uri: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          authorization_code?: string | null
          authorization_id?: string
          client_id?: string
          code_challenge?: string | null
          code_challenge_method?:
            | Database["auth"]["Enums"]["code_challenge_method"]
            | null
          created_at?: string
          expires_at?: string
          id?: string
          redirect_uri?: string
          resource?: string | null
          response_type?: Database["auth"]["Enums"]["oauth_response_type"]
          scope?: string
          state?: string | null
          status?: Database["auth"]["Enums"]["oauth_authorization_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_authorizations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_authorizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_clients: {
        Row: {
          client_name: string | null
          client_secret_hash: string | null
          client_type: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri: string | null
          created_at: string
          deleted_at: string | null
          grant_types: string
          id: string
          logo_uri: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          updated_at: string
        }
        Insert: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types: string
          id: string
          logo_uri?: string | null
          redirect_uris: string
          registration_type: Database["auth"]["Enums"]["oauth_registration_type"]
          updated_at?: string
        }
        Update: {
          client_name?: string | null
          client_secret_hash?: string | null
          client_type?: Database["auth"]["Enums"]["oauth_client_type"]
          client_uri?: string | null
          created_at?: string
          deleted_at?: string | null
          grant_types?: string
          id?: string
          logo_uri?: string | null
          redirect_uris?: string
          registration_type?: Database["auth"]["Enums"]["oauth_registration_type"]
          updated_at?: string
        }
        Relationships: []
      }
      oauth_consents: {
        Row: {
          client_id: string
          granted_at: string
          id: string
          revoked_at: string | null
          scopes: string
          user_id: string
        }
        Insert: {
          client_id: string
          granted_at?: string
          id: string
          revoked_at?: string | null
          scopes: string
          user_id: string
        }
        Update: {
          client_id?: string
          granted_at?: string
          id?: string
          revoked_at?: string | null
          scopes?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_consents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown
          not_after: string | null
          oauth_client_id: string | null
          refresh_token_counter: number | null
          refresh_token_hmac_key: string | null
          refreshed_at: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown
          not_after?: string | null
          oauth_client_id?: string | null
          refresh_token_counter?: number | null
          refresh_token_hmac_key?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "oauth_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: { Args: never; Returns: string }
      jwt: { Args: never; Returns: Json }
      role: { Args: never; Returns: string }
      uid: { Args: never; Returns: string }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      oauth_authorization_status: "pending" | "approved" | "denied" | "expired"
      oauth_client_type: "public" | "confidential"
      oauth_registration_type: "dynamic" | "manual"
      oauth_response_type: "code"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string | null
          actor_member_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta_json: Json | null
          project_id: string | null
        }
        Insert: {
          action?: string | null
          actor_member_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta_json?: Json | null
          project_id?: string | null
        }
        Update: {
          action?: string | null
          actor_member_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta_json?: Json | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_member_id_fkey"
            columns: ["actor_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action: string
          actor_member_id: string | null
          after_json: Json | null
          at: string
          before_json: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_member_id?: string | null
          after_json?: Json | null
          at?: string
          before_json?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_member_id?: string | null
          after_json?: Json | null
          at?: string
          before_json?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_actor_member_id_fkey"
            columns: ["actor_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          context_json: Json | null
          created_at: string
          id: string
          member_id: string | null
          resolved_at: string | null
          resolver_id: string | null
          severity: string | null
          team_id: string | null
          type: Database["public"]["Enums"]["alert_type"]
        }
        Insert: {
          context_json?: Json | null
          created_at?: string
          id?: string
          member_id?: string | null
          resolved_at?: string | null
          resolver_id?: string | null
          severity?: string | null
          team_id?: string | null
          type: Database["public"]["Enums"]["alert_type"]
        }
        Update: {
          context_json?: Json | null
          created_at?: string
          id?: string
          member_id?: string | null
          resolved_at?: string | null
          resolver_id?: string | null
          severity?: string | null
          team_id?: string | null
          type?: Database["public"]["Enums"]["alert_type"]
        }
        Relationships: []
      }
      api_access_logs: {
        Row: {
          api_key_id: string | null
          at: string
          id: string
          latency_ms: number | null
          route: string | null
          status: number | null
          tenant_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          at?: string
          id?: string
          latency_ms?: number | null
          route?: string | null
          status?: number | null
          tenant_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          at?: string
          id?: string
          latency_ms?: number | null
          route?: string | null
          status?: number | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          label: string | null
          last_used_at: string | null
          revoked_at: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          label?: string | null
          last_used_at?: string | null
          revoked_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          label?: string | null
          last_used_at?: string | null
          revoked_at?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_log: {
        Row: {
          finished_at: string | null
          id: string
          kind: string
          location: string | null
          started_at: string
          status: string | null
        }
        Insert: {
          finished_at?: string | null
          id?: string
          kind: string
          location?: string | null
          started_at?: string
          status?: string | null
        }
        Update: {
          finished_at?: string | null
          id?: string
          kind?: string
          location?: string | null
          started_at?: string
          status?: string | null
        }
        Relationships: []
      }
      billing_accounts: {
        Row: {
          customer_id: string
          default_pm_id: string | null
          provider: string
          tenant_id: string
        }
        Insert: {
          customer_id: string
          default_pm_id?: string | null
          provider: string
          tenant_id: string
        }
        Update: {
          customer_id?: string
          default_pm_id?: string | null
          provider?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_accounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount: number
          created_at: string
          ext_id: string
          id: string
          pdf_url: string | null
          provider: string
          status: string
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          ext_id: string
          id?: string
          pdf_url?: string | null
          provider: string
          status: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          ext_id?: string
          id?: string
          pdf_url?: string | null
          provider?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      boq_items: {
        Row: {
          boq_id: string
          category: string | null
          description: string | null
          id: string
          is_customer_supplied: boolean | null
          item_code: string | null
          qty: number
          spec_url: string | null
          unit: string | null
          unit_cost: number | null
          unit_price: number | null
        }
        Insert: {
          boq_id: string
          category?: string | null
          description?: string | null
          id?: string
          is_customer_supplied?: boolean | null
          item_code?: string | null
          qty?: number
          spec_url?: string | null
          unit?: string | null
          unit_cost?: number | null
          unit_price?: number | null
        }
        Update: {
          boq_id?: string
          category?: string | null
          description?: string | null
          id?: string
          is_customer_supplied?: boolean | null
          item_code?: string | null
          qty?: number
          spec_url?: string | null
          unit?: string | null
          unit_cost?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
        ]
      }
      boqs: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          markup_pct: number | null
          project_id: string
          source: Database["public"]["Enums"]["boq_source"]
          status: Database["public"]["Enums"]["boq_status"]
          subtotal: number | null
          total: number | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          markup_pct?: number | null
          project_id: string
          source: Database["public"]["Enums"]["boq_source"]
          status?: Database["public"]["Enums"]["boq_status"]
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          markup_pct?: number | null
          project_id?: string
          source?: Database["public"]["Enums"]["boq_source"]
          status?: Database["public"]["Enums"]["boq_status"]
          subtotal?: number | null
          total?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "boqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_timeslots: {
        Row: {
          capacity: number | null
          date: string
          end_time: string
          id: string
          notes: string | null
          start_time: string
          team_id: string | null
        }
        Insert: {
          capacity?: number | null
          date: string
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          team_id?: string | null
        }
        Update: {
          capacity?: number | null
          date?: string
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_timeslots_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          duration_sec: number | null
          id: string
          participants: Json | null
          project_id: string
          recording_url: string | null
          started_at: string
          started_by_member_id: string | null
        }
        Insert: {
          duration_sec?: number | null
          id?: string
          participants?: Json | null
          project_id: string
          recording_url?: string | null
          started_at?: string
          started_by_member_id?: string | null
        }
        Update: {
          duration_sec?: number | null
          id?: string
          participants?: Json | null
          project_id?: string
          recording_url?: string | null
          started_at?: string
          started_by_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_started_by_member_id_fkey"
            columns: ["started_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      change_order_items: {
        Row: {
          change_order_id: string
          description: string | null
          id: string
          item_code: string | null
          qty: number
          unit_price: number
        }
        Insert: {
          change_order_id: string
          description?: string | null
          id?: string
          item_code?: string | null
          qty?: number
          unit_price?: number
        }
        Update: {
          change_order_id?: string
          description?: string | null
          id?: string
          item_code?: string | null
          qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "change_order_items_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          approver_member_id: string | null
          created_at: string
          delta_total: number | null
          id: string
          project_id: string
          reason: string | null
          status: Database["public"]["Enums"]["change_status"]
        }
        Insert: {
          approver_member_id?: string | null
          created_at?: string
          delta_total?: number | null
          id?: string
          project_id: string
          reason?: string | null
          status?: Database["public"]["Enums"]["change_status"]
        }
        Update: {
          approver_member_id?: string | null
          created_at?: string
          delta_total?: number | null
          id?: string
          project_id?: string
          reason?: string | null
          status?: Database["public"]["Enums"]["change_status"]
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_approver_member_id_fkey"
            columns: ["approver_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoints: {
        Row: {
          at: string
          id: string
          lat: number | null
          lng: number | null
          note: string | null
          shift_id: string
          type: string
        }
        Insert: {
          at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          shift_id: string
          type: string
        }
        Update: {
          at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          note?: string | null
          shift_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkpoints_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      distance_bands: {
        Row: {
          cost_points: number
          id: string
          km_max: number | null
          km_min: number | null
          name: string
        }
        Insert: {
          cost_points: number
          id?: string
          km_max?: number | null
          km_min?: number | null
          name: string
        }
        Update: {
          cost_points?: number
          id?: string
          km_max?: number | null
          km_min?: number | null
          name?: string
        }
        Relationships: []
      }
      end_clients: {
        Row: {
          address_json: Json | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_json?: Json | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_json?: Json | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "end_clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          amount: number | null
          boq_id: string | null
          created_at: string
          id: string
          pdf_url: string | null
          project_id: string
          status: string
          zoho_estimate_id: string | null
        }
        Insert: {
          amount?: number | null
          boq_id?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          project_id: string
          status?: string
          zoho_estimate_id?: string | null
        }
        Update: {
          amount?: number | null
          boq_id?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          project_id?: string
          status?: string
          zoho_estimate_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      event_queue: {
        Row: {
          attempts: number
          id: string
          payload_json: Json
          run_at: string | null
          status: string
          topic: string
        }
        Insert: {
          attempts?: number
          id?: string
          payload_json: Json
          run_at?: string | null
          status?: string
          topic: string
        }
        Update: {
          attempts?: number
          id?: string
          payload_json?: Json
          run_at?: string | null
          status?: string
          topic?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          job_id: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          member_id: string | null
          receipt_url: string | null
          type: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          member_id?: string | null
          receipt_url?: string | null
          type?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          member_id?: string | null
          receipt_url?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          config_json: Json | null
          enabled: boolean
          id: string
          key: string
          scope: string
        }
        Insert: {
          config_json?: Json | null
          enabled?: boolean
          id?: string
          key: string
          scope?: string
        }
        Update: {
          config_json?: Json | null
          enabled?: boolean
          id?: string
          key?: string
          scope?: string
        }
        Relationships: []
      }
      geo_events: {
        Row: {
          details_json: Json | null
          detected_at: string
          event: string
          id: string
          job_id: string | null
          lat: number | null
          lng: number | null
          member_id: string
          project_id: string | null
        }
        Insert: {
          details_json?: Json | null
          detected_at?: string
          event: string
          id?: string
          job_id?: string | null
          lat?: number | null
          lng?: number | null
          member_id: string
          project_id?: string | null
        }
        Update: {
          details_json?: Json | null
          detected_at?: string
          event?: string
          id?: string
          job_id?: string | null
          lat?: number | null
          lng?: number | null
          member_id?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      geofences: {
        Row: {
          active: boolean
          center_lat: number | null
          center_lng: number | null
          id: string
          name: string
          polygon_json: Json | null
          radius_m: number | null
          type: string | null
        }
        Insert: {
          active?: boolean
          center_lat?: number | null
          center_lng?: number | null
          id?: string
          name: string
          polygon_json?: Json | null
          radius_m?: number | null
          type?: string | null
        }
        Update: {
          active?: boolean
          center_lat?: number | null
          center_lng?: number | null
          id?: string
          name?: string
          polygon_json?: Json | null
          radius_m?: number | null
          type?: string | null
        }
        Relationships: []
      }
      handover_docs: {
        Row: {
          doc_url: string
          id: string
          install_job_id: string
          signed_at: string | null
          signed_by_name: string | null
          signed_by_phone: string | null
        }
        Insert: {
          doc_url: string
          id?: string
          install_job_id: string
          signed_at?: string | null
          signed_by_name?: string | null
          signed_by_phone?: string | null
        }
        Update: {
          doc_url?: string
          id?: string
          install_job_id?: string
          signed_at?: string | null
          signed_by_name?: string | null
          signed_by_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handover_docs_install_job_id_fkey"
            columns: ["install_job_id"]
            isOneToOne: false
            referencedRelation: "install_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      holiday_calendar: {
        Row: {
          date: string
          id: string
          name: string | null
          tenant_id: string | null
        }
        Insert: {
          date: string
          id?: string
          name?: string | null
          tenant_id?: string | null
        }
        Update: {
          date?: string
          id?: string
          name?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holiday_calendar_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          first_seen_at: string
          id: string
          key: string
          source: string
        }
        Insert: {
          first_seen_at?: string
          id?: string
          key: string
          source: string
        }
        Update: {
          first_seen_at?: string
          id?: string
          key?: string
          source?: string
        }
        Relationships: []
      }
      install_assignments: {
        Row: {
          id: string
          install_job_id: string
          scheduled_timeslot_id: string | null
          team_id: string | null
        }
        Insert: {
          id?: string
          install_job_id: string
          scheduled_timeslot_id?: string | null
          team_id?: string | null
        }
        Update: {
          id?: string
          install_job_id?: string
          scheduled_timeslot_id?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "install_assignments_install_job_id_fkey"
            columns: ["install_job_id"]
            isOneToOne: false
            referencedRelation: "install_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_assignments_scheduled_timeslot_id_fkey"
            columns: ["scheduled_timeslot_id"]
            isOneToOne: false
            referencedRelation: "calendar_timeslots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      install_jobs: {
        Row: {
          created_at: string
          created_from_boq_id: string | null
          id: string
          preferred_timeslot_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["install_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_from_boq_id?: string | null
          id?: string
          preferred_timeslot_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["install_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_from_boq_id?: string | null
          id?: string
          preferred_timeslot_id?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["install_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "install_jobs_created_from_boq_id_fkey"
            columns: ["created_from_boq_id"]
            isOneToOne: false
            referencedRelation: "boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_jobs_preferred_timeslot_id_fkey"
            columns: ["preferred_timeslot_id"]
            isOneToOne: false
            referencedRelation: "calendar_timeslots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "install_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          created_at: string
          due_date: string | null
          id: string
          pdf_url: string | null
          project_id: string
          status: string
          zoho_invoice_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          pdf_url?: string | null
          project_id: string
          status?: string
          zoho_invoice_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          due_date?: string | null
          id?: string
          pdf_url?: string | null
          project_id?: string
          status?: string
          zoho_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      location_pings: {
        Row: {
          accuracy_m: number | null
          battery: number | null
          captured_at: string
          heading: number | null
          id: string
          job_id: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          lat: number | null
          lng: number | null
          member_id: string
          source: string | null
          speed_mps: number | null
        }
        Insert: {
          accuracy_m?: number | null
          battery?: number | null
          captured_at: string
          heading?: number | null
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          lat?: number | null
          lng?: number | null
          member_id: string
          source?: string | null
          speed_mps?: number | null
        }
        Update: {
          accuracy_m?: number | null
          battery?: number | null
          captured_at?: string
          heading?: number | null
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          lat?: number | null
          lng?: number | null
          member_id?: string
          source?: string | null
          speed_mps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "location_pings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      location_sessions: {
        Row: {
          date: string
          first_ping_at: string | null
          id: string
          last_ping_at: string | null
          member_id: string
          total_drive_km: number | null
          total_on_site_time: unknown
          total_time_on_break: unknown
          total_time_on_duty: unknown
        }
        Insert: {
          date: string
          first_ping_at?: string | null
          id?: string
          last_ping_at?: string | null
          member_id: string
          total_drive_km?: number | null
          total_on_site_time?: unknown
          total_time_on_break?: unknown
          total_time_on_duty?: unknown
        }
        Update: {
          date?: string
          first_ping_at?: string | null
          id?: string
          last_ping_at?: string | null
          member_id?: string
          total_drive_km?: number | null
          total_on_site_time?: unknown
          total_time_on_break?: unknown
          total_time_on_duty?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "location_sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      locations_shared: {
        Row: {
          id: string
          lat: number | null
          lng: number | null
          member_id: string | null
          project_id: string
          shared_at: string
        }
        Insert: {
          id?: string
          lat?: number | null
          lng?: number | null
          member_id?: string | null
          project_id: string
          shared_at?: string
        }
        Update: {
          id?: string
          lat?: number | null
          lng?: number | null
          member_id?: string | null
          project_id?: string
          shared_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_shared_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_shared_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_jobs: {
        Row: {
          completed_at: string | null
          id: string
          project_id: string
          scheduled_at: string | null
          status: string
          team_id: string | null
          type: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          project_id: string
          scheduled_at?: string | null
          status?: string
          team_id?: string | null
          type: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          project_id?: string
          scheduled_at?: string | null
          status?: string
          team_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          checksum: string | null
          created_at: string
          created_by_member_id: string | null
          deleted_at: string | null
          height: number | null
          id: string
          kind: string
          mime_type: string | null
          owner_id: string
          owner_type: string
          size_bytes: number | null
          url: string
          visibility: string
          width: number | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          created_by_member_id?: string | null
          deleted_at?: string | null
          height?: number | null
          id?: string
          kind: string
          mime_type?: string | null
          owner_id: string
          owner_type: string
          size_bytes?: number | null
          url: string
          visibility?: string
          width?: number | null
        }
        Update: {
          checksum?: string | null
          created_at?: string
          created_by_member_id?: string | null
          deleted_at?: string | null
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          owner_id?: string
          owner_type?: string
          size_bytes?: number | null
          url?: string
          visibility?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      media_links: {
        Row: {
          media_id: string
          owner_id: string
          owner_type: string
          tagged_at: string
        }
        Insert: {
          media_id: string
          owner_id: string
          owner_type: string
          tagged_at?: string
        }
        Update: {
          media_id?: string
          owner_id?: string
          owner_type?: string
          tagged_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_links_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          role: Database["public"]["Enums"]["member_role"]
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["member_role"]
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_dispatches: {
        Row: {
          channel: Database["public"]["Enums"]["message_channel"]
          error: string | null
          id: string
          member_id: string | null
          payload_json: Json | null
          provider_msg_id: string | null
          sent_at: string | null
          status: string
          template_key: string | null
          tenant_id: string | null
          to: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["message_channel"]
          error?: string | null
          id?: string
          member_id?: string | null
          payload_json?: Json | null
          provider_msg_id?: string | null
          sent_at?: string | null
          status?: string
          template_key?: string | null
          tenant_id?: string | null
          to: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["message_channel"]
          error?: string | null
          id?: string
          member_id?: string | null
          payload_json?: Json | null
          provider_msg_id?: string | null
          sent_at?: string | null
          status?: string
          template_key?: string | null
          tenant_id?: string | null
          to?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_dispatches_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_dispatches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          approved_by: string | null
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          id: string
          key: string
          locale: string | null
        }
        Insert: {
          approved_by?: string | null
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          key: string
          locale?: string | null
        }
        Update: {
          approved_by?: string | null
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          key?: string
          locale?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          author_member_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          media_url: string | null
          text: string | null
          thread_id: string
        }
        Insert: {
          author_member_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_url?: string | null
          text?: string | null
          thread_id: string
        }
        Update: {
          author_member_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          media_url?: string | null
          text?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_author_member_id_fkey"
            columns: ["author_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "project_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_prefs: {
        Row: {
          channel: Database["public"]["Enums"]["message_channel"]
          enabled: boolean
          member_id: string
          quiet_hours_json: Json | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["message_channel"]
          enabled?: boolean
          member_id: string
          quiet_hours_json?: Json | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["message_channel"]
          enabled?: boolean
          member_id?: string
          quiet_hours_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_prefs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          id: string
          link_url: string | null
          member_id: string
          read_at: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          body?: string | null
          id?: string
          link_url?: string | null
          member_id: string
          read_at?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          body?: string | null
          id?: string
          link_url?: string | null
          member_id?: string
          read_at?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_requests: {
        Row: {
          attempts: number
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          id: string
          purpose: string
          status: string
          to: string
        }
        Insert: {
          attempts?: number
          channel: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          purpose: string
          status?: string
          to: string
        }
        Update: {
          attempts?: number
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          purpose?: string
          status?: string
          to?: string
        }
        Relationships: []
      }
      outbox: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload_json: Json
          processed_at: string | null
          topic: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload_json: Json
          processed_at?: string | null
          topic: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload_json?: Json
          processed_at?: string | null
          topic?: string
        }
        Relationships: []
      }
      partners_applications: {
        Row: {
          city: string | null
          company_name: string
          contact_name: string
          cr_number: string | null
          cr_path: string | null
          email: string | null
          id: string
          industry: string | null
          lang: string
          phone: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string
          vat_number: string | null
          vat_path: string | null
          want_rate_book: boolean
        }
        Insert: {
          city?: string | null
          company_name: string
          contact_name: string
          cr_number?: string | null
          cr_path?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          lang?: string
          phone: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          vat_number?: string | null
          vat_path?: string | null
          want_rate_book?: boolean
        }
        Update: {
          city?: string | null
          company_name?: string
          contact_name?: string
          cr_number?: string | null
          cr_path?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          lang?: string
          phone?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          vat_number?: string | null
          vat_path?: string | null
          want_rate_book?: boolean
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          external_ref: string | null
          id: string
          invoice_id: string
          method: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          external_ref?: string | null
          id?: string
          invoice_id: string
          method?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          external_ref?: string | null
          id?: string
          invoice_id?: string
          method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_features: {
        Row: {
          enabled_bool: boolean | null
          key: string
          limit_int: number | null
          plan_code: string
        }
        Insert: {
          enabled_bool?: boolean | null
          key: string
          limit_int?: number | null
          plan_code: string
        }
        Update: {
          enabled_bool?: boolean | null
          key?: string
          limit_int?: number | null
          plan_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      plans: {
        Row: {
          code: string
          features_json: Json | null
          is_active: boolean
          name: string
          price_month: number | null
          price_year: number | null
          tax_percent: number | null
        }
        Insert: {
          code: string
          features_json?: Json | null
          is_active?: boolean
          name: string
          price_month?: number | null
          price_year?: number | null
          tax_percent?: number | null
        }
        Update: {
          code?: string
          features_json?: Json | null
          is_active?: boolean
          name?: string
          price_month?: number | null
          price_year?: number | null
          tax_percent?: number | null
        }
        Relationships: []
      }
      policy_acceptance: {
        Row: {
          accepted_at: string
          ip: string | null
          member_id: string
          policy_key: string
          version: string
        }
        Insert: {
          accepted_at?: string
          ip?: string | null
          member_id: string
          policy_key: string
          version: string
        }
        Update: {
          accepted_at?: string
          ip?: string | null
          member_id?: string
          policy_key?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acceptance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          from_state: Database["public"]["Enums"]["presence_state"] | null
          id: string
          member_id: string
          reason: string | null
          to_state: Database["public"]["Enums"]["presence_state"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          from_state?: Database["public"]["Enums"]["presence_state"] | null
          id?: string
          member_id: string
          reason?: string | null
          to_state: Database["public"]["Enums"]["presence_state"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          from_state?: Database["public"]["Enums"]["presence_state"] | null
          id?: string
          member_id?: string
          reason?: string | null
          to_state?: Database["public"]["Enums"]["presence_state"]
        }
        Relationships: [
          {
            foreignKeyName: "presence_history_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_status: {
        Row: {
          member_id: string
          note: string | null
          since_at: string
          source: string | null
          state: Database["public"]["Enums"]["presence_state"]
        }
        Insert: {
          member_id: string
          note?: string | null
          since_at?: string
          source?: string | null
          state?: Database["public"]["Enums"]["presence_state"]
        }
        Update: {
          member_id?: string
          note?: string | null
          since_at?: string
          source?: string | null
          state?: Database["public"]["Enums"]["presence_state"]
        }
        Relationships: [
          {
            foreignKeyName: "presence_status_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      price_list_items: {
        Row: {
          brand: string | null
          default_price: number
          id: string
          item_code: string
          model: string | null
          name: string
          price_list_id: string
          spec_url: string | null
          unit: string | null
        }
        Insert: {
          brand?: string | null
          default_price?: number
          id?: string
          item_code: string
          model?: string | null
          name: string
          price_list_id: string
          spec_url?: string | null
          unit?: string | null
        }
        Update: {
          brand?: string | null
          default_price?: number
          id?: string
          item_code?: string
          model?: string | null
          name?: string
          price_list_id?: string
          spec_url?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          id: string
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_lists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          id: string
          min_ping_interval: number | null
          retention_days_raw: number | null
          scope: string
          share_location_with_customer: boolean
          track_off_shift: boolean
        }
        Insert: {
          id?: string
          min_ping_interval?: number | null
          retention_days_raw?: number | null
          scope?: string
          share_location_with_customer?: boolean
          track_off_shift?: boolean
        }
        Update: {
          id?: string
          min_ping_interval?: number | null
          retention_days_raw?: number | null
          scope?: string
          share_location_with_customer?: boolean
          track_off_shift?: boolean
        }
        Relationships: []
      }
      project_end_clients: {
        Row: {
          end_client_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          end_client_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          end_client_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          deleted_at: string | null
          file_type: string | null
          file_url: string
          id: string
          project_id: string
          title: string | null
          uploaded_at: string
          uploaded_by_member_id: string | null
        }
        Insert: {
          deleted_at?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          project_id: string
          title?: string | null
          uploaded_at?: string
          uploaded_by_member_id?: string | null
        }
        Update: {
          deleted_at?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          project_id?: string
          title?: string | null
          uploaded_at?: string
          uploaded_by_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_member_id_fkey"
            columns: ["uploaded_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      project_threads: {
        Row: {
          id: string
          project_id: string
          type: string
        }
        Insert: {
          id?: string
          project_id: string
          type: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_threads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by_member_id: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          tenant_id: string
          updated_at: string
          view_mode: string | null
        }
        Insert: {
          created_at?: string
          created_by_member_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          tenant_id: string
          updated_at?: string
          view_mode?: string | null
        }
        Update: {
          created_at?: string
          created_by_member_id?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          tenant_id?: string
          updated_at?: string
          view_mode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          id: string
          key: string
          limit_count: number
          tenant_id: string | null
          window_sec: number
        }
        Insert: {
          id?: string
          key: string
          limit_count: number
          tenant_id?: string | null
          window_sec: number
        }
        Update: {
          id?: string
          key?: string
          limit_count?: number
          tenant_id?: string | null
          window_sec?: number
        }
        Relationships: []
      }
      rating_aggregates: {
        Row: {
          avg_overall: number
          count: number
          id: string
          last_rated_at: string | null
          scope: string
          scope_id: string
        }
        Insert: {
          avg_overall?: number
          count?: number
          id?: string
          last_rated_at?: string | null
          scope: string
          scope_id: string
        }
        Update: {
          avg_overall?: number
          count?: number
          id?: string
          last_rated_at?: string | null
          scope?: string
          scope_id?: string
        }
        Relationships: []
      }
      rating_forms: {
        Row: {
          created_at: string
          for_role: string
          id: string
          is_active: boolean
          schema_json: Json
          scope: string
        }
        Insert: {
          created_at?: string
          for_role: string
          id?: string
          is_active?: boolean
          schema_json: Json
          scope: string
        }
        Update: {
          created_at?: string
          for_role?: string
          id?: string
          is_active?: boolean
          schema_json?: Json
          scope?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          answers_json: Json | null
          comment: string | null
          context_id: string
          context_type: Database["public"]["Enums"]["rating_context"]
          created_at: string
          id: string
          overall_score: number
          ratee_member_id: string | null
          ratee_team_id: string | null
          ratee_tenant_id: string | null
          ratee_type: Database["public"]["Enums"]["rating_ratee_type"]
          rater_end_client_id: string | null
          rater_member_id: string | null
          rater_type: string
        }
        Insert: {
          answers_json?: Json | null
          comment?: string | null
          context_id: string
          context_type: Database["public"]["Enums"]["rating_context"]
          created_at?: string
          id?: string
          overall_score: number
          ratee_member_id?: string | null
          ratee_team_id?: string | null
          ratee_tenant_id?: string | null
          ratee_type: Database["public"]["Enums"]["rating_ratee_type"]
          rater_end_client_id?: string | null
          rater_member_id?: string | null
          rater_type: string
        }
        Update: {
          answers_json?: Json | null
          comment?: string | null
          context_id?: string
          context_type?: Database["public"]["Enums"]["rating_context"]
          created_at?: string
          id?: string
          overall_score?: number
          ratee_member_id?: string | null
          ratee_team_id?: string | null
          ratee_tenant_id?: string | null
          ratee_type?: Database["public"]["Enums"]["rating_ratee_type"]
          rater_end_client_id?: string | null
          rater_member_id?: string | null
          rater_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ratee_member_id_fkey"
            columns: ["ratee_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ratee_team_id_fkey"
            columns: ["ratee_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ratee_tenant_id_fkey"
            columns: ["ratee_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_end_client_id_fkey"
            columns: ["rater_end_client_id"]
            isOneToOne: false
            referencedRelation: "end_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_member_id_fkey"
            columns: ["rater_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_settings: {
        Row: {
          chat_days: number | null
          id: string
          media_days: number | null
          raw_location_days: number | null
          scope: string
        }
        Insert: {
          chat_days?: number | null
          id?: string
          media_days?: number | null
          raw_location_days?: number | null
          scope?: string
        }
        Update: {
          chat_days?: number | null
          id?: string
          media_days?: number | null
          raw_location_days?: number | null
          scope?: string
        }
        Relationships: []
      }
      rules_config: {
        Row: {
          id: string
          key: string
          scope: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          scope?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          scope?: string
          value?: string | null
        }
        Relationships: []
      }
      shift_schedules: {
        Row: {
          end_at: string
          id: string
          member_id: string | null
          note: string | null
          start_at: string
          team_id: string | null
        }
        Insert: {
          end_at: string
          id?: string
          member_id?: string | null
          note?: string | null
          start_at: string
          team_id?: string | null
        }
        Update: {
          end_at?: string
          id?: string
          member_id?: string | null
          note?: string | null
          start_at?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_schedules_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_schedules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          id: string
          member_id: string
          opened_at: string
          opened_by: string | null
          planned_shift_id: string | null
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          id?: string
          member_id: string
          opened_at?: string
          opened_by?: string | null
          planned_shift_id?: string | null
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          id?: string
          member_id?: string
          opened_at?: string
          opened_by?: string | null
          planned_shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_planned_shift_id_fkey"
            columns: ["planned_shift_id"]
            isOneToOne: false
            referencedRelation: "shift_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          id: string
          plan_code: string
          renews_at: string | null
          start_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          tenant_id: string
        }
        Insert: {
          cancel_at?: string | null
          id?: string
          plan_code: string
          renews_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tenant_id: string
        }
        Update: {
          cancel_at?: string | null
          id?: string
          plan_code?: string
          renews_at?: string | null
          start_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachments: Json | null
          author_member_id: string | null
          body: string | null
          created_at: string
          deleted_at: string | null
          id: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          author_member_id?: string | null
          body?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          author_member_id?: string | null
          body?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_author_member_id_fkey"
            columns: ["author_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          opened_by_member_id: string | null
          priority: string | null
          project_id: string | null
          sla_due_at: string | null
          status: string
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          opened_by_member_id?: string | null
          priority?: string | null
          project_id?: string | null
          sla_due_at?: string | null
          status?: string
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          opened_by_member_id?: string | null
          priority?: string | null
          project_id?: string | null
          sla_due_at?: string | null
          status?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_opened_by_member_id_fkey"
            columns: ["opened_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_assignments: {
        Row: {
          assigned_by_member_id: string | null
          id: string
          scheduled_timeslot_id: string | null
          survey_request_id: string
          team_id: string | null
        }
        Insert: {
          assigned_by_member_id?: string | null
          id?: string
          scheduled_timeslot_id?: string | null
          survey_request_id: string
          team_id?: string | null
        }
        Update: {
          assigned_by_member_id?: string | null
          id?: string
          scheduled_timeslot_id?: string | null
          survey_request_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_assignments_assigned_by_member_id_fkey"
            columns: ["assigned_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_scheduled_timeslot_id_fkey"
            columns: ["scheduled_timeslot_id"]
            isOneToOne: false
            referencedRelation: "calendar_timeslots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_survey_request_id_fkey"
            columns: ["survey_request_id"]
            isOneToOne: false
            referencedRelation: "survey_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_pricing_rules: {
        Row: {
          active: boolean
          default_points_new_customer: number
          free_on_close_deal: boolean
          id: string
        }
        Insert: {
          active?: boolean
          default_points_new_customer?: number
          free_on_close_deal?: boolean
          id?: string
        }
        Update: {
          active?: boolean
          default_points_new_customer?: number
          free_on_close_deal?: boolean
          id?: string
        }
        Relationships: []
      }
      survey_reports: {
        Row: {
          attachments: Json | null
          finalized_at: string | null
          id: string
          leader_member_id: string | null
          report_text: string | null
          survey_request_id: string
        }
        Insert: {
          attachments?: Json | null
          finalized_at?: string | null
          id?: string
          leader_member_id?: string | null
          report_text?: string | null
          survey_request_id: string
        }
        Update: {
          attachments?: Json | null
          finalized_at?: string | null
          id?: string
          leader_member_id?: string | null
          report_text?: string | null
          survey_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_reports_leader_member_id_fkey"
            columns: ["leader_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_reports_survey_request_id_fkey"
            columns: ["survey_request_id"]
            isOneToOne: false
            referencedRelation: "survey_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_requests: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          location: Json | null
          preferred_timeslot_id: string | null
          project_id: string
          requested_by_member_id: string | null
          status: Database["public"]["Enums"]["survey_status"]
          work_type: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          location?: Json | null
          preferred_timeslot_id?: string | null
          project_id: string
          requested_by_member_id?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          work_type?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          location?: Json | null
          preferred_timeslot_id?: string | null
          project_id?: string
          requested_by_member_id?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_requests_requested_by_member_id_fkey"
            columns: ["requested_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string | null
          related_survey_request_id: string | null
          tenant_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason?: string | null
          related_survey_request_id?: string | null
          tenant_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string | null
          related_survey_request_id?: string | null
          tenant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_transactions_related_survey_request_id_fkey"
            columns: ["related_survey_request_id"]
            isOneToOne: false
            referencedRelation: "survey_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_wallets: {
        Row: {
          balance: number
          last_reset_at: string | null
          tenant_id: string
          tier_init_credits: number
        }
        Insert: {
          balance?: number
          last_reset_at?: string | null
          tenant_id: string
          tier_init_credits?: number
        }
        Update: {
          balance?: number
          last_reset_at?: string | null
          tenant_id?: string
          tier_init_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_wallets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_errors: {
        Row: {
          attempts: number | null
          entity: string
          entity_id: string | null
          error: string | null
          id: string
          last_attempt_at: string | null
          resolved_at: string | null
          system: string
        }
        Insert: {
          attempts?: number | null
          entity: string
          entity_id?: string | null
          error?: string | null
          id?: string
          last_attempt_at?: string | null
          resolved_at?: string | null
          system: string
        }
        Update: {
          attempts?: number | null
          entity?: string
          entity_id?: string | null
          error?: string | null
          id?: string
          last_attempt_at?: string | null
          resolved_at?: string | null
          system?: string
        }
        Relationships: []
      }
      system_secrets: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value_encrypted: string
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value_encrypted: string
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value_encrypted?: string
        }
        Relationships: []
      }
      tag_links: {
        Row: {
          owner_id: string
          owner_type: string
          tag_id: string
        }
        Insert: {
          owner_id: string
          owner_type: string
          tag_id: string
        }
        Update: {
          owner_id?: string
          owner_type?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_links_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          active_from: string | null
          active_to: string | null
          member_id: string
          role_in_team: string | null
          team_id: string
        }
        Insert: {
          active_from?: string | null
          active_to?: string | null
          member_id: string
          role_in_team?: string | null
          team_id: string
        }
        Update: {
          active_from?: string | null
          active_to?: string | null
          member_id?: string
          role_in_team?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          leader_member_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          leader_member_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          leader_member_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_member_id_fkey"
            columns: ["leader_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_branding: {
        Row: {
          color: string | null
          custom_domain: string | null
          dns_status: string | null
          logo_url: string | null
          pdf_template: string | null
          tenant_id: string
        }
        Insert: {
          color?: string | null
          custom_domain?: string | null
          dns_status?: string | null
          logo_url?: string | null
          pdf_template?: string | null
          tenant_id: string
        }
        Update: {
          color?: string | null
          custom_domain?: string | null
          dns_status?: string | null
          logo_url?: string | null
          pdf_template?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          created_at: string
          default_markup_pct: number | null
          measurement_units: string | null
          payment_gateway_cfg_json: Json | null
          tenant_id: string
          updated_at: string
          whatsapp_sender_id: string | null
          zoho_org_id: string | null
        }
        Insert: {
          created_at?: string
          default_markup_pct?: number | null
          measurement_units?: string | null
          payment_gateway_cfg_json?: Json | null
          tenant_id: string
          updated_at?: string
          whatsapp_sender_id?: string | null
          zoho_org_id?: string | null
        }
        Update: {
          created_at?: string
          default_markup_pct?: number | null
          measurement_units?: string | null
          payment_gateway_cfg_json?: Json | null
          tenant_id?: string
          updated_at?: string
          whatsapp_sender_id?: string | null
          zoho_org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          currency: string
          id: string
          name: string
          status: string
          tier: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          name: string
          status?: string
          tier?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          name?: string
          status?: string
          tier?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timesheets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          end_at: string | null
          gps_json: Json | null
          id: string
          job_id: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          member_id: string
          start_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          end_at?: string | null
          gps_json?: Json | null
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          member_id: string
          start_at: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          end_at?: string | null
          gps_json?: Json | null
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          member_id?: string
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_charges: {
        Row: {
          amount: number
          band_id: string | null
          created_at: string
          id: string
          job_id: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          km: number | null
          load_size: string | null
          project_id: string | null
        }
        Insert: {
          amount?: number
          band_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          km?: number | null
          load_size?: string | null
          project_id?: string | null
        }
        Update: {
          amount?: number
          band_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          km?: number | null
          load_size?: string | null
          project_id?: string | null
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          context_id: string | null
          context_type: string | null
          created_at: string
          id: string
          key: string
          qty: number
          tenant_id: string
        }
        Insert: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          key: string
          qty?: number
          tenant_id: string
        }
        Update: {
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          key?: string
          qty?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string | null
          language: string | null
          phone: string | null
          photo_url: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name?: string | null
          language?: string | null
          phone?: string | null
          photo_url?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string | null
          language?: string | null
          phone?: string | null
          photo_url?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          expiry_at: string | null
          id: string
          item_ref: string | null
          project_id: string
          terms: string | null
        }
        Insert: {
          expiry_at?: string | null
          id?: string
          item_ref?: string | null
          project_id: string
          terms?: string | null
        }
        Update: {
          expiry_at?: string | null
          id?: string
          item_ref?: string | null
          project_id?: string
          terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warranties_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks_log: {
        Row: {
          attempts: number
          created_at: string
          event_type: string
          id: string
          payload_json: Json
          source: string
          status: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          event_type: string
          id?: string
          payload_json: Json
          source: string
          status?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          event_type?: string
          id?: string
          payload_json?: Json
          source?: string
          status?: string
        }
        Relationships: []
      }
      zoho_links: {
        Row: {
          estimate_id: string | null
          id: string
          invoice_id: string | null
          last_synced_at: string | null
          project_id: string | null
          sync_status: string | null
          zoho_id: string
          zoho_module: string
        }
        Insert: {
          estimate_id?: string | null
          id?: string
          invoice_id?: string | null
          last_synced_at?: string | null
          project_id?: string | null
          sync_status?: string | null
          zoho_id: string
          zoho_module: string
        }
        Update: {
          estimate_id?: string | null
          id?: string
          invoice_id?: string | null
          last_synced_at?: string | null
          project_id?: string | null
          sync_status?: string | null
          zoho_id?: string
          zoho_module?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoho_links_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zoho_links_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zoho_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      auth_user_id: { Args: never; Returns: string }
      has_role: {
        Args: { target: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_bocc_internal: { Args: never; Returns: boolean }
      is_tenant_member: { Args: { t: string }; Returns: boolean }
      normalize_ksa_phone: { Args: { p: string }; Returns: string }
    }
    Enums: {
      alert_type: "late_to_site" | "idle" | "off_route" | "no_signal"
      app_role: "admin" | "approver" | "preparer" | "technician" | "client"
      boq_source: "ai" | "bocc" | "manual"
      boq_status: "draft" | "final"
      change_status: "proposed" | "approved" | "rejected"
      install_status: "scheduled" | "in_progress" | "done" | "closed"
      job_type: "survey" | "install" | "support"
      member_role:
        | "admin"
        | "team_member"
        | "workforce_leader"
        | "technician"
        | "helper"
        | "company_manager"
        | "customer_employee"
      message_channel: "whatsapp" | "email" | "push"
      presence_state:
        | "offline"
        | "on_duty"
        | "on_break"
        | "driving"
        | "on_site"
        | "unavailable"
      profile_status: "pending" | "approved" | "rejected"
      project_status: "idea" | "estimation" | "survey" | "install" | "closed"
      rating_context: "survey_request" | "install_job" | "project"
      rating_ratee_type: "team" | "member" | "customer" | "end_client"
      submission_status: "pending" | "approved" | "rejected"
      subscription_status: "active" | "trial" | "canceled" | "past_due"
      survey_status: "requested" | "scheduled" | "done" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
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
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      oauth_authorization_status: ["pending", "approved", "denied", "expired"],
      oauth_client_type: ["public", "confidential"],
      oauth_registration_type: ["dynamic", "manual"],
      oauth_response_type: ["code"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
  public: {
    Enums: {
      alert_type: ["late_to_site", "idle", "off_route", "no_signal"],
      app_role: ["admin", "approver", "preparer", "technician", "client"],
      boq_source: ["ai", "bocc", "manual"],
      boq_status: ["draft", "final"],
      change_status: ["proposed", "approved", "rejected"],
      install_status: ["scheduled", "in_progress", "done", "closed"],
      job_type: ["survey", "install", "support"],
      member_role: [
        "admin",
        "team_member",
        "workforce_leader",
        "technician",
        "helper",
        "company_manager",
        "customer_employee",
      ],
      message_channel: ["whatsapp", "email", "push"],
      presence_state: [
        "offline",
        "on_duty",
        "on_break",
        "driving",
        "on_site",
        "unavailable",
      ],
      profile_status: ["pending", "approved", "rejected"],
      project_status: ["idea", "estimation", "survey", "install", "closed"],
      rating_context: ["survey_request", "install_job", "project"],
      rating_ratee_type: ["team", "member", "customer", "end_client"],
      submission_status: ["pending", "approved", "rejected"],
      subscription_status: ["active", "trial", "canceled", "past_due"],
      survey_status: ["requested", "scheduled", "done", "cancelled"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const
