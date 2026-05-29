export class User {
  id!: string;
  aud!: string;
  role!: string;
  email!: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  recovery_sent_at?: string;
  last_sign_in_at?: string;

  app_metadata?: AppMetadata;
  user_metadata?: UserMetadata;
  identities?: UserIdentity[];

  created_at?: string;
  updated_at?: string;
  is_anonymous?: boolean;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);

    this.app_metadata = data?.app_metadata
      ? new AppMetadata(data.app_metadata)
      : undefined;

    this.user_metadata = data?.user_metadata
      ? new UserMetadata(data.user_metadata)
      : undefined;

    this.identities = data?.identities?.map(
      i => new UserIdentity(i)
    ) || [];
  }
}

export class AppMetadata {
  provider?: string;
  providers?: string[];

  constructor(data?: Partial<AppMetadata>) {
    Object.assign(this, data);
  }
}

export class UserMetadata {
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  sub?: string;

  constructor(data?: Partial<UserMetadata>) {
    Object.assign(this, data);
  }
}

export class UserIdentity {
  identity_id?: string;
  id?: string;
  user_id?: string;
  identity_data?: IdentityData;
  provider?: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  email?: string;

  constructor(data?: Partial<UserIdentity>) {
    Object.assign(this, data);

    this.identity_data = data?.identity_data
      ? new IdentityData(data.identity_data)
      : undefined;
  }
}

export class IdentityData {
  email?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  sub?: string;

  constructor(data?: Partial<IdentityData>) {
    Object.assign(this, data);
  }
}
