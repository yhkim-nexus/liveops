import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { ExperimentVariant } from "../types/experiment";

interface VariantResultsTableProps {
  variants: ExperimentVariant[];
  showResults?: boolean;
}

export function VariantResultsTable({
  variants,
  showResults = false,
}: VariantResultsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>변형 이름</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>트래픽 %</TableHead>
          {showResults && (
            <>
              <TableHead>표본 크기</TableHead>
              <TableHead>전환율</TableHead>
              <TableHead>p-value</TableHead>
              <TableHead>신뢰구간</TableHead>
              <TableHead>상대 개선</TableHead>
              <TableHead>결과</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant) => (
          <TableRow key={variant.id}>
            <TableCell className="font-medium">{variant.name}</TableCell>
            <TableCell>
              {variant.isControl ? (
                <Badge variant="outline">Control</Badge>
              ) : (
                <Badge variant="secondary">변형</Badge>
              )}
            </TableCell>
            <TableCell>{variant.trafficPercent}%</TableCell>
            {showResults && (
              <>
                <TableCell className="tabular-nums">
                  {variant.result?.sampleSize?.toLocaleString("ko-KR") ?? "-"}
                </TableCell>
                <TableCell className="tabular-nums">
                  {variant.result?.conversionRate != null
                    ? `${variant.result.conversionRate.toFixed(1)}%`
                    : "-"}
                </TableCell>
                <TableCell className="tabular-nums">
                  {variant.result?.pValue != null
                    ? variant.result.pValue < 0.001
                      ? "< 0.001"
                      : variant.result.pValue.toFixed(4)
                    : "-"}
                </TableCell>
                <TableCell className="tabular-nums">
                  {variant.result?.ciLower != null &&
                  variant.result?.ciUpper != null
                    ? `[${variant.result.ciLower.toFixed(1)}%, ${variant.result.ciUpper.toFixed(1)}%]`
                    : "-"}
                </TableCell>
                <TableCell className="tabular-nums">
                  {variant.result?.relativeImprovement != null
                    ? `${variant.result.relativeImprovement > 0 ? "+" : ""}${variant.result.relativeImprovement.toFixed(1)}%`
                    : "-"}
                </TableCell>
                <TableCell>
                  {variant.result?.isWinner ? (
                    <Badge className="bg-green-100 text-green-700">
                      승자
                    </Badge>
                  ) : null}
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
