import React, { useEffect, useRef, useState } from "react";

interface EditorProps {
  value: string; // 초기값
  onValueChange: (content: string) => void; // 내용 변경 시 호출되는 콜백
  setImageName: (value: string[]) => void; // 에디터 내 이미지 이름 배열 전달
  initHtml?: string;
  height?: number;
}

const API_URL =
  process.env.REACT_APP_API_BASE_URL || "http://13.125.187.22:8082";

const Editor: React.FC<EditorProps> = ({
  value = "",
  onValueChange,
  setImageName,
  height = 700,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  //   const user = useAuth();
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // iframe 내부에 Summernote 에디터를 위한 HTML 주입
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Summernote Editor</title>
        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
        <!-- Summernote CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-bs4.css">
        <style>
          body { margin: 0; padding: 0; height: 100vh; }
        </style>
      </head>
      <body>
        <!-- 에디터로 사용할 textarea (resize 비활성화) -->
        <textarea id="summernote" style="resize: none;"></textarea>
        <!-- jQuery -->
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <!-- Bootstrap JS -->
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <!-- Summernote JS -->
        <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.js"></script>
      </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const onIframeLoad = () => {
      const iframeWindow = iframe.contentWindow as any;
      if (!iframeWindow) return;
      const $ = iframeWindow.jQuery;
      if (!$) {
        console.error("jQuery가 로드되지 않았습니다.");
        return;
      }

      // Summernote 초기화
      $("#summernote", iframeDoc).summernote({
        placeholder: "내용을 입력해주세요.",
        tabsize: 2,
        height: height,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "italic", "underline", "clear"]],
          ["fontname", ["fontname"]], // 글꼴 선택 메뉴 추가
          ["fontsize", ["fontsize"]], // 폰트 사이즈 선택 메뉴 추가
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture", "video"]],
          ["view", ["fullscreen", "codeview", "help"]],
        ],
        fontNames: [
          // Windows, macOS 공통
          "Arial",
          "Helvetica",
          "Times New Roman",
          "Courier New",
          "Georgia",
          "Verdana",
          "Tahoma",
          "Trebuchet MS",
          "Impact",
          "Comic Sans MS",
          "Segoe UI",
          "Lucida Sans Unicode",
          "Palatino Linotype",
          "Consolas",
          "Gill Sans",
          // macOS 전용 또는 추가 폰트
          "Apple SD Gothic Neo",
          // 한글 지원 폰트 (Windows & macOS)
          "맑은 고딕",
          "돋움",
          "굴림",
          "바탕",
          // 웹에서 많이 쓰이는 한글 폰트
          "Nanum Gothic",
          "Nanum Myeongjo",
        ],
        fontSizes: [
          "8",
          "9",
          "10",
          "11",
          "12",
          "14",
          "16",
          "18",
          "20",
          "22",
          "24",
          "26",
          "28",
          "36",
          "48",
          "64",
          "82",
          "150",
        ],
        callbacks: {
          onInit: () => {
            console.log("✅ Summernote (iframe) 초기화 완료");
            setIsEditorReady(true);
            // 초기값 설정 (value prop가 존재하면)
            if (value) {
              $("#summernote", iframeDoc).summernote("code", value);
            }
            // 편집 영역에 resize 비활성화를 위한 스타일 적용
            const $editable = $("#summernote", iframeDoc)
              .next(".note-editor")
              .find(".note-editable");
            $editable.attr(
              "style",
              ($editable.attr("style") || "") + "; resize: none !important;",
            );
          },
          onChange: (contents: string) => {
            // 에디터 내용 변경 시 부모에 업데이트
            onValueChange(contents);
          },

          //이미지 업로드 API 연동
          onImageUpload: async (files: FileList) => {
            const $ = iframeWindow.jQuery;
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              try {
                // FormData 객체 생성 및 파일 추가
                const formData = new FormData();
                formData.append("file", file);

                // 이미지 업로드 API 호출
                const response = await fetch(
                  `${API_URL}/api/v1/editor/upload/image`,
                  {
                    method: "POST",
                    body: formData,
                  },
                );

                if (!response.ok) {
                  throw new Error(`이미지 업로드 실패: ${response.status}`);
                }

                const uploadResponse = await response.json();

                // 이미지 URL이 반환되면 에디터에 삽입
                if (uploadResponse && uploadResponse.url) {
                  $("#summernote", iframeDoc).summernote(
                    "insertImage",
                    uploadResponse.url,
                  );

                  // 여기서 추가 로직 처리...
                }
              } catch (error) {
                console.error("이미지 업로드 중 오류 발생", error);
              }
            }
          },
        },
      });
    };

    // iframe의 load 이벤트 발생 시 onIframeLoad 호출
    if (iframe.contentWindow) {
      iframe.contentWindow.addEventListener("load", onIframeLoad);
      if (iframe.contentDocument?.readyState === "complete") {
        onIframeLoad();
      }
    }
  }, []); // 최초 1회 실행

  // value prop(즉, productHTMLData)가 변경될 때 에디터 내용을 업데이트하는 useEffect 추가
  useEffect(() => {
    if (!isEditorReady) return;
    const iframe = iframeRef.current as any;
    if (!iframe) return;
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;
    const $ = iframe.contentWindow?.jQuery;
    if (!$) return;

    const $summernote = $("#summernote", iframeDoc);

    // summernote가 현재 포커스되어 있는지 확인 (예시로 포커스 여부를 체크하는 방식)
    const isFocused = $summernote
      .next(".note-editor")
      .find(".note-editable")
      .is(":focus");

    if (!isFocused) {
      // 포커스되지 않은 경우에만 동기화 (커서 초기화 문제 완화)
      const currentContent = $summernote.summernote("code");
      if (currentContent !== value) {
        $summernote.summernote("code", value);
      }
    }
  }, [value, isEditorReady]);

  // 에디터 내용 저장 함수 (부모 업데이트용)
  const save = () => {
    const iframe = iframeRef.current;
    if (!iframe || !isEditorReady) {
      return;
    }
    const $ = (iframe.contentWindow as any).jQuery;
    // 현재 에디터 HTML 내용 추출
    const content = $("#summernote", iframe.contentDocument).summernote("code");
    console.log("🚀 저장된 내용:", content);
    // 부모의 HTML 콘텐츠 상태 업데이트
    onValueChange(content);

    // DOMParser로 HTML 파싱 후, <img> 태그에서 imageName 추출
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const imgs = doc.querySelectorAll("img");
    const imageNames: string[] = [];
    imgs.forEach((img) => {
      try {
        const src = img.getAttribute("src");
        if (src) {
          /*const url = new URL(src);
          const imageName = url.searchParams.get("imageName");*/

          //파일 경로에서 추출
          const path = src.split("/");
          const imageName = path[path.length - 1];

          if (imageName) {
            imageNames.push(imageName);
          }
        }
      } catch (e) {
        console.error("이미지 src 파싱 중 오류 발생", e);
      }
    });
    // 부모 컴포넌트에 이미지 이름 배열 전달
    setImageName(imageNames);
  };

  // isEditorReady가 true인 경우, 5초마다 save 함수 자동 실행
  useEffect(() => {
    if (!isEditorReady) return;
    const intervalId = setInterval(() => {
      save();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isEditorReady]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* 에디터 전용 iframe (전역 스타일 격리) */}
      <iframe
        ref={iframeRef}
        title="Summernote Editor"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
};

export default Editor;
