import { EmptyPortfolioIcon } from "@/components/icons/Icon";

type EmptyTabProps = {
    message: string;
};

export default function EmptyTab({ message }: EmptyTabProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-gray-900">
            <EmptyPortfolioIcon />
            <p>{message}</p>
        </div>
    );
}
