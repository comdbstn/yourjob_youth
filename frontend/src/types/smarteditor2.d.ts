declare namespace nhn.husky {
  interface EZCreator {
    createInIFrame(config: {
      oAppRef: any[];
      elPlaceHolder: string;
      sSkinURI: string;
      fCreator: string;
      htParams: {
        bUseToolbar: boolean;
        bUseVerticalResizer: boolean;
        bUseModeChanger: boolean;
        oStyleMap: {
          fontFamily: boolean;
        };
      };
    }): void;
  }
}

declare const nhn: {
  husky: {
    EZCreator: nhn.husky.EZCreator;
  };
}; 