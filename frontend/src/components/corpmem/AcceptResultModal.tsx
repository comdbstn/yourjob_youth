import React, { useState } from "react";
import CustomModal from "../common/CustomModal";
import "./AcceptResultModal.css";

interface AcceptResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (title: string, content: string) => void;
    width?: string;
}

export default function AcceptResultModal(props: AcceptResultModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleConfirm = () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        props.onConfirm(title, content);
        // 모달 닫힐 때 입력값 초기화
        setTitle("");
        setContent("");
    };

    const handleClose = () => {
        props.onClose();
        // 모달 닫힐 때 입력값 초기화
        setTitle("");
        setContent("");
    };

    return (
        <CustomModal
            isOpen={props.isOpen}
            onClose={handleClose}
            title="합격안내"
            width={props.width ? props.width : "950px"}
        >
            <div
                className="AcceptModalContainer"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    height: "100%",
                }}
            >
                <div
                    className="row"
                    style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                    <p style={{ fontSize: "18px", fontWeight: "500", flexShrink: "0" }}>
                        발표제목
                    </p>
                    <div
                        style={{
                            border: "#eaeaea 1px solid",
                            width: "100%",
                            padding: "20px",
                            borderRadius: "15px",
                        }}
                    >
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="제목을 작성해주세요"
                            style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: "16px",
                            }}
                        />
                    </div>
                </div>
                <div
                    className="row"
                    style={{ display: "flex", gap: "10px", alignItems: "start" }}
                >
                    <p
                        style={{
                            fontSize: "18px",
                            fontWeight: "500",
                            flexShrink: "0",
                            paddingTop: "20px",
                        }}
                    >
                        발표내용
                    </p>
                    <div
                        style={{
                            border: "#eaeaea 1px solid",
                            width: "100%",
                            padding: "20px",
                            height: "500px",
                            borderRadius: "15px",
                        }}
                    >
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="입사 관련 안내사항을 작성해주세요."
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    outline: "none",
                    fontSize: "16px",
                    resize: "none",
                    fontFamily: "inherit",
                    lineHeight: "1.8"
                }}
            />
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        width: "100%",
                        justifyContent: "center",
                    }}
                >
                    <button
                        style={{
                            width: "150px",
                            height: "60px",
                            border: "#eaeaea 1px solid",
                            borderRadius: "15px",
                            background: "#2e7fdb",
                            color: "white",
                            cursor: "pointer",
                        }}
                        onClick={handleConfirm}
                    >
                        합격발표
                    </button>
                    <button
                        style={{
                            width: "150px",
                            height: "60px",
                            border: "#eaeaea 1px solid",
                            borderRadius: "15px",
                            color: "#666666",
                            background: "white",
                            cursor: "pointer",
                        }}
                        onClick={handleClose}
                    >
                        취소
                    </button>
                </div>
            </div>
        </CustomModal>
    );
}