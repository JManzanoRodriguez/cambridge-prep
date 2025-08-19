import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          level: string;
          subscription_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          level?: string;
          subscription_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          level?: string;
          subscription_type?: string;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          level: string;
          questions: any;
          score: number;
          total_questions: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          level: string;
          questions: any;
          score?: number;
          total_questions: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          level?: string;
          questions?: any;
          score?: number;
          total_questions?: number;
          completed_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          skill_type: string;
          current_level: string;
          progress_percentage: number;
          strengths: string[];
          weaknesses: string[];
          last_updated: string;
          total_questions_answered?: number;
          correct_answers?: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_type: string;
          current_level: string;
          progress_percentage?: number;
          strengths?: string[];
          weaknesses?: string[];
          last_updated?: string;
          total_questions_answered?: number;
          correct_answers?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_type?: string;
          current_level?: string;
          progress_percentage?: number;
          strengths?: string[];
          weaknesses?: string[];
          last_updated?: string;
          total_questions_answered?: number;
          correct_answers?: number;
        };
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient<Database>(environment.supabase.url, environment.supabase.anonKey);

    // Escuchar cambios en la autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  // Autenticación
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (data.user && !error) {
      // Crear perfil de usuario
      await this.createUserProfile(data.user.id, email, name);
    }

    return { data, error };
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  // Gestión de usuarios
  private async createUserProfile(userId: string, email: string, name: string) {
    // Verificar que tenemos una sesión activa
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    if (!session) {
      return { data: null, error: { message: 'No hay sesión activa' } };
    }

    const { data, error } = await this.supabase.from('users').insert({
      id: userId,
      email,
      name,
      level: 'A1',
      subscription_type: 'free',
    });

    if (error) {
      console.error('Error creando perfil:', error);
    }

    return { data, error };
  }

  async getUserProfile(userId: string): Promise<{ data: Database['public']['Tables']['users']['Row'] | null; error: any }> {
    // Primero verificar si el usuario existe en auth.users
    const { data: authUser } = await this.supabase.auth.getUser();

    const { data, error } = await this.supabase.from('users').select('*').eq('id', userId).single();

    // Si no existe el perfil, intentar crearlo
    if (error && error.code === 'PGRST116') {
      if (authUser.user) {
        const createResult = await this.createUserProfile(
          authUser.user.id,
          authUser.user.email || '',
          authUser.user.user_metadata?.['name'] || 'Usuario'
        );

        if (!createResult.error) {
          // Intentar obtener el perfil nuevamente
          return await this.getUserProfile(userId);
        }
      }
    }

    return { data, error };
  }

  async updateUserProfile(userId: string, updates: Database['public']['Tables']['users']['Update']) {
    const { data, error } = await this.supabase.from('users').update(updates).eq('id', userId);

    return { data, error };
  }

  // Gestión de quizzes
  async saveQuizResult(quizData: Database['public']['Tables']['quizzes']['Insert']) {
    console.log('💾 Guardando resultado de quiz:', quizData);
    const { data, error } = await this.supabase.from('quizzes').insert(quizData);

    if (error) {
      console.error('❌ Error guardando quiz:', error);
    } else {
      console.log('✅ Quiz guardado exitosamente');
    }

    return { data, error };
  }

  async getUserQuizzes(userId: string, limit: number = 10) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  async getQuizStats(userId: string) {
    const { data, error } = await this.supabase.from('quizzes').select('type, score, total_questions, created_at').eq('user_id', userId);

    return { data, error };
  }

  // Gestión de progreso
  async getUserProgress(userId: string) {
    const { data, error } = await this.supabase.from('user_progress').select('*').eq('user_id', userId);

    return { data, error };
  }

  async updateUserProgress(progressData: Database['public']['Tables']['user_progress']['Insert']) {
    // Usar upsert para insertar o actualizar
    const { data, error } = await this.supabase.from('user_progress').upsert(progressData, {
      onConflict: 'user_id,skill_type',
    });

    return { data, error };
  }

  // Función para llamar Edge Functions (para IA)
  async generateQuizWithAI(request: any) {
    const { data, error } = await this.supabase.functions.invoke('generate-quiz', {
      body: request,
    });

    return { data, error };
  }

  // Obtener cliente Supabase para operaciones avanzadas
  get client() {
    return this.supabase;
  }
}
