import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    nhn: {
      husky: {
        EZCreator: {
          createInIFrame: (config: {
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
          }) => void;
        };
      };
    };
  }
}

interface SmartEditorRef extends Array<any> {
  getById?: {
    [key: string]: {
      exec: (command: string, args: any[]) => void;
    };
  };
}

export const useSmartEditor = (elementId: string) => {
  const editorsRef = useRef<SmartEditorRef>([]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/js/smarteditor2/js/HuskyEZCreator.js';
    script.async = true;

    script.onload = () => {
      const oEditors: any[] = [];
      window.nhn.husky.EZCreator.createInIFrame({
        oAppRef: oEditors,
        elPlaceHolder: elementId,
        sSkinURI: '/js/smarteditor2/SmartEditor2Skin.html',
        fCreator: 'createSEditor2',
        htParams: {
          bUseToolbar: true,
          bUseVerticalResizer: true,
          bUseModeChanger: false,
          oStyleMap: {
            fontFamily: false
          }
        }
      });
      editorsRef.current = oEditors;
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [elementId]);

  const getContent = () => {
    if (editorsRef.current && editorsRef.current.getById) {
      editorsRef.current.getById[elementId].exec('UPDATE_CONTENTS_FIELD', []);
      return (document.getElementById(elementId) as HTMLTextAreaElement)?.value || '';
    }
    return '';
  };

  return { getContent };
}; 