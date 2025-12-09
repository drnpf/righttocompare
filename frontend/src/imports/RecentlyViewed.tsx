import imgPixel101 from "figma:asset/97e15958dda8a68c72375b01cfb9d69534512ed8.png";
import imgIphone161 from "figma:asset/7243092b9d248569f9ed82517f0a760b59ebcb8a.png";
import img from "figma:asset/c677ba4036733b50cf4df2b9c6932db195bf7661.png";

/**
 * @figmaAssetKey 9277eff78b3b19a4ca6d0376c86b83093c9c746b
 */
function Pixel10({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Pixel 10">
      <div className="aspect-[1604/1200] relative shrink-0 w-full" data-name="pixel10 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgPixel101} />
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[22px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-center w-full">
        <p className="leading-[1.4]">Pixel 10</p>
      </div>
    </div>
  );
}

/**
 * @figmaAssetKey 7aa35d05a891ba8d7fbdfaea8811c3954eb60460
 */
function IPhone16({ className }: { className?: string }) {
  return (
    <div className={className} data-name="iPhone 16">
      <div className="absolute bottom-0 flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] left-0 not-italic right-0 text-[14px] text-black text-center top-[78.43%]">
        <p className="leading-[1.4]">iPhone 16</p>
      </div>
      <div className="absolute aspect-[2699/1807] left-0 right-[0.83%] top-0" data-name="iphone16 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgIphone161} />
      </div>
    </div>
  );
}

function RecentlyViewedContainer() {
  return (
    <div className="absolute box-border gap-[30px] grid grid-cols-[repeat(5,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[138px] left-[5px] px-[35px] py-[20px] rounded-[100px] top-[32px] w-[1270px]" data-name="Recently Viewed Container">
      <div aria-hidden="true" className="absolute border-[3px] border-[rgba(0,0,0,0.5)] border-solid inset-[-1.5px] pointer-events-none rounded-[101.5px]" />
      <IPhone16 className="[grid-area:1_/_3] h-[102px] relative shrink-0 w-[120px]" />
      <div className="[grid-area:1_/_2] content-stretch flex flex-col items-center justify-center relative self-start shrink-0 w-[120px]" data-name="Galaxy S25">
        <div className="aspect-[1920/1280] relative shrink-0 w-full" data-name="samsung_galaxy_s25 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={img} />
        </div>
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[22px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-center w-full">
          <p className="leading-[1.4]">Galaxy S25</p>
        </div>
      </div>
      <Pixel10 className="[grid-area:1_/_1] content-stretch flex flex-col items-center relative self-start shrink-0 w-[107px]" />
    </div>
  );
}

export default function RecentlyViewed() {
  return (
    <div className="relative size-full" data-name="Recently Viewed">
      <div className="absolute flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] left-[67px] not-italic text-[24px] text-black text-nowrap top-[14.5px] tracking-[-0.48px] translate-y-[-50%]">
        <p className="leading-[1.2] whitespace-pre">Recently Viewed</p>
      </div>
      <RecentlyViewedContainer />
    </div>
  );
}