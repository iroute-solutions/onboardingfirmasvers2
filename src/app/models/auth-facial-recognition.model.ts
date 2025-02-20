export class AuthRecognitionFacial {
  token!: string;
  expireSeconds: string = '';
  refreshToken: string = '';
}

export class AuthDataFacialLiveness {
  username: string = '';
  password: string = '';
  awsKmsId: string = '';
  bucketSave: string = '';
}
