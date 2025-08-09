import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { VisaType } from "../dummy/options";

const API_URL =
  process.env.REACT_APP_API_BASE_URL || "http://13.125.187.22:8082";

// 기존: Firebase OAuth를 통한 일반회원 가입/로그인
export const firebaseOAuth = createAsyncThunk(
  "auth/firebaseOAuth",
  async (idToken: string, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/oauth2/firebase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.message || "OAuth 처리 실패");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export interface CorpJoinRequest {
  accountId: string;
  password: string;
  managerName: string;
  managerPhone: string;
  companyName: string;
  businessRegistrationNumber: string;
  capital: string;
  revenue: string;
  netIncome: string;
  companyAddress: string;
  corporateType: number;
  employeeCount?: number;
  businessCertificate?: File;
}

export interface CorpLoginRequest {
  accountId: string;
  password: string;
}

export interface EmailSignupRequest {
  name: string;
  englishName: string;
  email: string;
  password: string;
  phone: string;
  birth: string;
  gender: string;
  nationality: string;
  address: string;
  address_detail: string;
  zip_code: string;
  visa: VisaType[];
  profileImage?: string;
}

export const corpJoin = createAsyncThunk(
  "auth/corpJoin",
  async (payload: CorpJoinRequest, thunkAPI) => {
    try {
      const formData = new FormData();

      // JSON 데이터를 FormData에 추가
      const jsonData = { ...payload };
      formData.append("data", JSON.stringify(jsonData));

      // 파일이 있는 경우 FormData에 추가
      if (payload.businessCertificate) {
        formData.append("businessCertificate", payload.businessCertificate);
      }

      const response = await fetch(`${API_URL}/api/v1/auth/corpjoin`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 409) {
        return thunkAPI.rejectWithValue("이미 가입된 기업입니다.");
      }
      if (response.status !== 201) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "기업 회원가입 실패",
        );
      }
      // 성공 시 빈 객체 반환
      return {};
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const corpLogin = createAsyncThunk(
  "auth/corpLogin",
  async (payload: CorpLoginRequest, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/corplogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "403") {
          return thunkAPI.rejectWithValue("비밀번호가 일치하지 않습니다.");
        }
        return thunkAPI.rejectWithValue(
          errorData.message || "기업 로그인 실패",
        );
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const emailSignup = createAsyncThunk(
  "auth/emailSignup",
  async (payload: EmailSignupRequest, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 409) {
          alert("이미 가입된 메일주소입니다.");

          return thunkAPI.rejectWithValue("이미 가입된 메일주소입니다.");
        }
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "이메일 회원가입 실패",
        );
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const oauthCallback = createAsyncThunk(
  "auth/oauthCallback",
  async (code: string, thunkAPI) => {
    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/callback?code=${code}`,
        {
          method: "GET",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "OAuth 콜백 처리 실패",
        );
      }
      const data = await response.json();
      return data.token;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const startGoogleSignup = createAsyncThunk(
  "auth/startGoogleSignup",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/google`, {
        method: "GET",
      });
      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(
          errorData.message || "Google OAuth URL 요청 실패",
        );
      }
      const googleUrl = await response.text();
      return googleUrl;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
  corpJoinStatus: "idle" | "pending" | "succeeded" | "failed";
  fileUploadProgress: number;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  corpJoinStatus: "idle",
  fileUploadProgress: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.corpJoinStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(firebaseOAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(firebaseOAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(firebaseOAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // corpJoin 처리
      .addCase(corpJoin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.corpJoinStatus = "pending";
      })
      .addCase(corpJoin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.corpJoinStatus = "succeeded";
      })
      .addCase(corpJoin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.corpJoinStatus = "failed";
      })
      // corpLogin 처리
      .addCase(corpLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(corpLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(corpLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // oauthCallback 처리
      .addCase(oauthCallback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(oauthCallback.fulfilled, (state, action) => {
        state.loading = false;
        // 토큰을 별도로 저장하거나 user 객체에 포함할 수 있습니다.
        state.user = { token: action.payload };
      })
      .addCase(oauthCallback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(startGoogleSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startGoogleSignup.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(startGoogleSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(emailSignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(emailSignup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(emailSignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetStatus } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
