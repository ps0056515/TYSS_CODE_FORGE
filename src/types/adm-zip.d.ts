declare module "adm-zip" {
  class AdmZip {
    constructor(inputFilePath?: string | Buffer);
    extractAllTo(targetPath: string, overwrite?: boolean): void;
  }
  export default AdmZip;
}
