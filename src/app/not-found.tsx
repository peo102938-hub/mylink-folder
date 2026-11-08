import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191f28] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md bg-white rounded-[24px] border border-[#e5e8eb] p-8 shadow-[0_4px_24px_rgba(25,31,40,0.04)] flex flex-col items-center text-center">
        {/* 아이콘 */}
        <div className="w-16 h-16 rounded-full bg-[#feebee] text-[#f04452] flex items-center justify-center mb-4">
          <UserX className="w-8 h-8 stroke-[1.8]" />
        </div>

        {/* 안내 텍스트 */}
        <span className="text-[12px] font-bold tracking-wider uppercase text-[#f04452] bg-[#feebee] px-2.5 py-0.5 rounded-full mb-2">
          404 Not Found
        </span>
        <h1 className="text-[20px] font-bold text-[#191f28] mb-1">
          사용자를 찾을 수 없어요
        </h1>
        <p className="text-[14px] text-[#6b7684] leading-relaxed mb-6">
          요청하신 사용자가 존재하지 않거나,<br />
          아직 사용자 아이디(username)가 설정되지 않은 페이지입니다.
        </p>

        {/* 홈으로 돌아가기 버튼 */}
        <Link href="/" className="w-full">
          <Button
            type="button"
            className="w-full h-12 rounded-[16px] bg-[#3182f6] hover:bg-[#1b64da] text-white active:scale-[0.98] text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>마이링크 홈으로 이동</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
