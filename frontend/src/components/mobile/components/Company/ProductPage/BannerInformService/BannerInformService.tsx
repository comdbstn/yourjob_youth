import { MetaTagHelmet } from "../../../../../common/MetaTagHelmet";
import MainFooter from "../../../MainFooter/MainFooter";
import MobileMainHeader from "../../../MainHeader/MainHeader";
import "./BannerInformService.css";
export default function BannerInformService() {
  return (
    <div className="BannerInformService_container">
      <MetaTagHelmet title="채용공고 상품" description="채용공고 상품" />
      <MobileMainHeader />
      <h3 className="siteH3Label">채용공고 상품</h3>
      <p className="sectionHeader">유어잡 광고상품</p>
      <img src="/img/mobile/img.png" className="mt-15" />
      <p className="sectionHeader mt-20 mb-20">디스플레이 배너광고 상품</p>
      <section className="infoSection">
        <div className="flexGap10 items-center">
          {" "}
          <div className="circleDiv">01</div>
          <div className="columnDiv">
            <p className="blueLabel">가로형 채용공고</p>
            <p className="grayLabel">사이즈 848px x 155px(Rolling Max 7)</p>
          </div>
        </div>

        <div className="tableSection">
          <div className="tableRow tbHeader">
            <div className="tableCol tbHeader">이용기간</div>
            <div className="tableCol tbHeader">이용금액(VAT포함)</div>
          </div>
          <div className="tableRow">
            <div className="tableCol">3일</div>
            <div className="tableCol">150,000원</div>
          </div>
          <div className="tableRow">
            <div className="tableCol">3일</div>
            <div className="tableCol">150,000원</div>
          </div>
          <div className="tableRow">
            <div className="tableCol">3일</div>
            <div className="tableCol">150,000원</div>
          </div>
        </div>
        <div className="flexGap10 items-center">
          {" "}
          <div className="circleDiv">02</div>
          <div className="columnDiv">
            <p className="blueLabel">VVIP 채용관</p>
            <p className="grayLabel">월 1,000,000원(vat포함)</p>
          </div>
        </div>

        <div className="tableSection">
          <div className="tableRow tbHeader">
            <div className="tableCol tbHeader">이용기간</div>
            <div className="tableCol tbHeader">이용금액(VAT포함)</div>
          </div>
          <div className="tableRow">
            <div className="tableCol">3일</div>
            <div className="tableCol">150,000원</div>
          </div>
          <div className="tableRow">
            <div className="tableCol">3일</div>
            <div className="tableCol">150,000원</div>
          </div>
          <div className="tableRow">
            <div className="tableCol">3일</div>
            <div className="tableCol">150,000원</div>
          </div>
        </div>
      </section>
      <p className="sectionHeader mt-20">메인 채용관 상품</p>
      <section className="infoSection mt-20">
        <div className="flexGap10 items-center">
          {" "}
          <div className="circleDiv">03</div>
          <div className="columnDiv">
            <p className="blueLabel">VVIP 채용관</p>
            <p className="grayLabel">월 1,000,000원(vat포함)</p>
          </div>
        </div>

        <div className="flexGap10 items-center">
          {" "}
          <div className="circleDiv">04</div>
          <div className="columnDiv">
            <p className="blueLabel">VVIP 채용관</p>
            <p className="grayLabel">월 1,000,000원(vat포함)</p>
          </div>
        </div>
        <div className="flexGap10 items-center">
          {" "}
          <div className="circleDiv">05</div>
          <div className="columnDiv">
            <p className="blueLabel">VVIP 채용관</p>
            <p className="grayLabel">월 1,000,000원(vat포함)</p>
          </div>
        </div>
      </section>

      <MainFooter />
    </div>
  );
}
