import React, { useEffect, useState, useMemo, useRef } from "react";
import CorpLayout from "../layout/CorpLayout";
import "../../../public/css/corpmypage.css";
import "../../../public/css/nice-select.css";
import "../../../public/css/adProduct.css";
import { getAdProducts, applyAdProduct } from "../../api/adProduct";
import { AdProduct, AdProductRequest } from "../../types/adProduct";
import { axiosInstance } from "../../api/axios";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import NiceSelectBox from "../common/NiceSelectBox";
import { MetaTagHelmet } from "../common/MetaTagHelmet";

// 공고 타입 정의
interface JobPost {
  jobId: number;
  title: string;
  status: string;
  postNumber?: string;
  companyName?: string;
}

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const ProductAd: React.FC = () => {
  registerLocale("ko", ko);

  const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
  const [products, setProducts] = useState<AdProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 공고 관련 상태 추가
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [showJobSearch, setShowJobSearch] = useState<boolean>(false);
  const [jobSearchKeyword, setJobSearchKeyword] = useState<string>("");
  const [isJobSearching, setIsJobSearching] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdProducts();
        let list: AdProduct[] = [];
        if (Array.isArray(response)) list = response;
        else if (response && "products" in response)
          list = response.products || [];
        setProducts(list);
      } catch (err) {
        console.error(err);
        setError("광고상품 데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };
    fetchData();
  }, []);

  // 공고 목록 불러오기
  const fetchJobPosts = async (query: string = "") => {
    setIsJobSearching(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.append("query", query);
      }
      // 본인의 공고만 조회
      const response = await axiosInstance.get("/api/v1/corpmem/posts", {
        params,
      });

      // API 응답 형태에 따라 처리
      let postsList: JobPost[] = [];
      if (Array.isArray(response.data)) {
        postsList = response.data;
      } else if (
        response.data.content &&
        Array.isArray(response.data.content)
      ) {
        postsList = response.data.content;
      }

      setJobPosts(postsList);
    } catch (err) {
      console.error("공고 목록 조회 실패:", err);
      setError("공고 목록을 불러오는 중 오류가 발생했습니다.");
      setJobPosts([]);
    } finally {
      setIsJobSearching(false);
    }
  };

  // 공고 검색 처리
  const handleJobSearch = () => {
    fetchJobPosts(jobSearchKeyword);
  };

  // 공고 검색창에서 엔터 키 처리
  const handleJobSearchKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleJobSearch();
    }
  };

  // 공고 선택 처리
  const handleSelectJob = (jobPost: JobPost) => {
    setSelectedJob(jobPost);
    setShowJobSearch(false);
  };

  // 상품별 코드 매핑 (01~05)
  const getProductCode = (product: AdProduct): string => {
    switch (product.productType) {
      case "horizontal":
        return "01";
      case "rectangle":
        return "02";
      case "vvip":
        return "03";
      case "vip":
        return "04";
      case "special":
        return "05";
      default:
        return product.id.toString().padStart(2, "0");
    }
  };

  // 상품명에서 기간 제거
  const getBaseName = (name: string): string =>
    name.replace(/\s*(?:\d+일|\(\d+회\))$/, "");

  // 코드 순으로 그룹핑 후 정렬
  const groupedProducts = useMemo(() => {
    const map: Record<
      string,
      {
        code: string;
        baseName: string;
        size: string;
        maxRolling: number;
        items: AdProduct[];
      }
    > = {};
    products.forEach((p) => {
      const code = getProductCode(p);
      if (!map[code]) {
        map[code] = {
          code,
          baseName: getBaseName(p.name),
          size: p.size,
          maxRolling: p.maxRolling || 0,
          items: [],
        };
      }
      map[code].items.push(p);
    });
    return Object.values(map).sort((a, b) => a.code.localeCompare(b.code));
  }, [products]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
    setError("");

    // 파일 입력 필드 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setBannerFile(null);

    // 선택한 상품이 공고 연결이 필요한 타입인지 확인 (vvip, vip, special)
    const prod = products.find((p) => p.id.toString() === e.target.value);
    if (
      prod &&
      (prod.productType === "vvip" ||
        prod.productType === "vip" ||
        prod.productType === "special")
    ) {
      // 공고 검색 목록 표시 준비
      if (jobPosts.length === 0) {
        fetchJobPosts();
      }
    } else {
      // 광고 상품 타입이 배너일 경우 공고 선택 초기화
      setSelectedJob(null);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setBannerFile(e.target.files[0]);
      setError("");
    } else {
      setBannerFile(null);
    }
  };

  // 선택한 상품이 배너 유형인지 확인 (01 또는 02)
  const isBannerProduct = useMemo(() => {
    if (!selectedProduct) return false;
    const prod = products.find((p) => p.id.toString() === selectedProduct);
    if (!prod) return false;
    return (
      prod.productType === "horizontal" || prod.productType === "rectangle"
    );
  }, [selectedProduct, products]);

  // 선택한 상품이 공고 연결이 필요한 타입인지 확인 (vvip, vip, special)
  const isJobLinkProduct = useMemo(() => {
    if (!selectedProduct) return false;
    const prod = products.find((p) => p.id.toString() === selectedProduct);
    if (!prod) return false;
    return (
      prod.productType === "vvip" ||
      prod.productType === "vip" ||
      prod.productType === "special"
    );
  }, [selectedProduct, products]);

  const handleSubmit = async () => {
    if (!window.confirm("해당 내용으로 신청하시겠습니까?")) {
      return;
    }

    if (!selectedProduct || !startDate) {
      setError("모든 필수 항목을 선택해주세요.");
      return;
    }

    // 배너 상품인데 파일이 없는 경우 검증
    if (isBannerProduct && !bannerFile) {
      setError("배너 이미지를 첨부해주세요.");
      return;
    }

    // 공고 연결 상품인데 공고를 선택하지 않은 경우 검증
    if (isJobLinkProduct && !selectedJob) {
      setError("연결할 채용공고를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const prod = products.find((p) => p.id.toString() === selectedProduct);
      if (!prod) throw new Error("선택한 상품을 찾을 수 없습니다.");

      // 공통 요청 객체 생성
      const request: AdProductRequest = {
        productId: prod.id, // 상품 ID (백엔드에서 상품 정보를 조회하는 데 사용)
        bannerType: prod.productType,
        periodDays: prod.periodDays,
        startDate,
        paymentMethod: "bank",
        title: prod.name,
        groupName: "main",
      };

      // 공고 연결 상품인 경우 공고 ID 추가
      if (isJobLinkProduct && selectedJob) {
        request.linkTarget = selectedJob.jobId.toString();
        request.linkTargetType = "job";
      }

      // 배너 상품인 경우 파일 추가
      if (isBannerProduct && bannerFile) {
        request.file = bannerFile;
      }

      // API 호출
      const res = await applyAdProduct(request);

      if (res.success) {
        alert("광고상품 신청이 완료되었습니다.");
        if (res.paymentInfo?.paymentId) {
          window.location.href = `/corpmem/productmypage`;
        }
      } else {
        setError(res.message || "광고상품 신청 중 오류가 발생했습니다.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "광고상품 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CorpLayout>
      <MetaTagHelmet title="광고상품" description="광고상품" />
      <div className="container-center-horizontal">
        <div className="product-ad crop-wrap screen">
          <div className="container">
            <div className="head_txt">유어잡 광고상품</div>

            {/* 상품 리스트 */}
            <div className="ad_container mb70">
              <div className="card col5">
                <div className="card_body cardBg">
                  <img src="/img/ad_area.png" alt="광고 영역" />
                </div>
              </div>
              <div className="card col6">
                <div className="head_txt01">디스플레이 배너광고 상품</div>
                <div className="card_body mb60">
                  {groupedProducts.map((group) => (
                    <div key={group.code} className="product-item">
                      <div className="num-title">
                        <div className="box">{group.code}</div>
                        <div className="box-txt">
                          <p>{group.baseName}</p>
                          <p>
                            사이즈 {group.size || "기본"}
                            {group.maxRolling
                              ? `(Rolling Max ${group.maxRolling})`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="bbstable table-list mb70">
                        <table className="mb20">
                          <colgroup>
                            <col style={{ width: "124px" }} />
                            <col />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>이용단위</th>
                              <th>이용금액</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items
                              .sort((a, b) => {
                                if (a.explosureType === b.explosureType) {
                                  return a.explosureType === "기간별"
                                    ? a.periodDays - b.periodDays
                                    : a.exposureCount - b.exposureCount;
                                }
                                return a.explosureType.localeCompare(
                                  b.explosureType
                                );
                              })
                              .map((item) => (
                                <tr
                                  key={`${group.code}-${item.explosureType}-${item.periodDays}-${item.exposureCount}`}
                                >
                                  <td className="cell-default">
                                    {item.explosureType === "기간별"
                                      ? `${item.periodDays}일`
                                      : `${item.exposureCount}건`}
                                  </td>
                                  <td className="cell-default">
                                    {item.price.toLocaleString()}원
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 신청 폼 */}
            <div className="ad_product_select card">
              <div className="selBox">
                <select
                  name="product"
                  value={selectedProduct}
                  onChange={handleProductChange}
                >
                  <option value="">광고상품 선택</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* 채용공고 검색 (vvip, vip, special 상품 선택 시) */}
                {isJobLinkProduct && (
                  <NiceSelectBox
                    value={selectedJob?.jobId.toString() || ""}
                    options={jobPosts.map((job) => ({
                      label: job.title,
                      value: job.jobId.toString(),
                    }))}
                    onChange={(value: string | null) => {
                      if (value) {
                        const job = jobPosts.find(
                          (job) => job.jobId.toString() === value
                        );
                        if (job) {
                          handleSelectJob(job);
                        }
                      }
                    }}
                  />
                )}

                {/* 배너 이미지 업로드 (01 또는 02 배너 상품 선택 시) */}
                {isBannerProduct && (
                  <div className="fileBox">
                    <label htmlFor="bannerImageUpload">배너 이미지 첨부</label>
                    <input
                      type="file"
                      id="bannerImageUpload"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="form-control"
                    />
                    {bannerFile && (
                      <div className="file-name">{bannerFile.name}</div>
                    )}
                  </div>
                )}

                <label>희망 시작날짜</label>
                <div className="dateBox w05">
                  <i className="fa-regular fa-calendar-days" />
                  <DatePicker
                    onChangeRaw={(e) => e?.preventDefault()}
                    id="receptsdate"
                    className={`form-control`}
                    placeholderText="2025-05-21"
                    dateFormat="yyyy-MM-dd"
                    selected={startDate ? new Date(startDate) : null}
                    locale="ko"
                    onChange={(date: Date | null) => {
                      const value = date
                        ? `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                          ).padStart(2, "0")}-${String(date.getDate()).padStart(
                            2,
                            "0"
                          )}`
                        : "";
                      // handleInputChange가 ChangeEvent 핸들러라면
                      handleStartDateChange({
                        target: {
                          name: "startDate",
                          value,
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                  />
                </div>
              </div>
              <button
                type="button"
                className="productBtn"
                onClick={handleSubmit}
                disabled={
                  !selectedProduct ||
                  !startDate ||
                  isSubmitting ||
                  (isBannerProduct && !bannerFile) ||
                  (isJobLinkProduct && !selectedJob)
                }
              >
                {isSubmitting ? "신청 중..." : "광고상품 신청"}
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    </CorpLayout>
  );
};

export default ProductAd;
