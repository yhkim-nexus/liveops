"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useEventTaxonomy,
  useCreateEventDefinition,
} from "@/features/segments/hooks/use-segment-queries";
import type { EventDefinition } from "@/features/segments/types/segment";

export default function TaxonomyPage() {
  const { data: events, isLoading } = useEventTaxonomy();
  const createMutation = useCreateEventDefinition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = () => {
    if (!newName.trim() || !newDisplayName.trim()) return;
    createMutation.mutate(
      {
        name: newName.trim(),
        displayName: newDisplayName.trim(),
        description: newDescription.trim(),
        parameters: [],
        computedProperties: [],
        computedRules: [],
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewName("");
          setNewDisplayName("");
          setNewDescription("");
        },
      },
    );
  };

  const toggleRow = (name: string) => {
    setExpandedRow((prev) => (prev === name ? null : name));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">이벤트 택소노미</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          이벤트 추가
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom 이벤트 추가</DialogTitle>
            <DialogDescription>
              새로운 사용자 정의 이벤트를 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="evt-name">이벤트 이름 *</Label>
              <Input
                id="evt-name"
                placeholder="예: item_purchased"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-display">표시명 *</Label>
              <Input
                id="evt-display"
                placeholder="예: 아이템 구매"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evt-desc">설명</Label>
              <Input
                id="evt-desc"
                placeholder="이벤트에 대한 설명"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newName.trim() ||
                !newDisplayName.trim() ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? "생성 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-muted-foreground">이벤트가 없습니다.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>이벤트명</TableHead>
                  <TableHead>표시명</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">파라미터</TableHead>
                  <TableHead className="text-right">
                    Computed 속성
                  </TableHead>
                  <TableHead>생성일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((evt) => (
                  <>
                    <TableRow
                      key={evt.name}
                      className="cursor-pointer"
                      onClick={() => toggleRow(evt.name)}
                    >
                      <TableCell>
                        {expandedRow === evt.name ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {evt.name}
                      </TableCell>
                      <TableCell>{evt.displayName}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            evt.category === "builtin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {evt.category === "builtin"
                            ? "내장"
                            : "커스텀"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {evt.parameters.length}개
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {evt.computedProperties.length}개
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(evt.createdAt).toLocaleDateString(
                          "ko-KR",
                          { month: "2-digit", day: "2-digit" },
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRow === evt.name && (
                      <TableRow key={`${evt.name}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/50 p-4">
                          <ExpandedEventDetail event={evt} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ExpandedEventDetail({ event }: { event: EventDefinition }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Description */}
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          {event.description}
        </p>

        {/* Parameters */}
        <h4 className="text-sm font-medium mb-2">파라미터</h4>
        {event.parameters.length === 0 ? (
          <p className="text-sm text-muted-foreground">파라미터 없음</p>
        ) : (
          <div className="space-y-1">
            {event.parameters.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 text-sm"
              >
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {p.name}
                </code>
                <span className="text-muted-foreground">{p.type}</span>
                {p.required && (
                  <span className="text-xs text-orange-600">필수</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Computed Property Rules */}
      <div>
        <h4 className="text-sm font-medium mb-2">연결된 Computed 속성 규칙</h4>
        {event.computedRules.length === 0 ? (
          <p className="text-sm text-muted-foreground">연결된 규칙 없음</p>
        ) : (
          <div className="space-y-1.5">
            {event.computedRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 text-sm"
              >
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {rule.eventName}
                </code>
                <span className="text-muted-foreground">&rarr;</span>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  {rule.propertyKey}
                </span>
                <span className="text-muted-foreground text-xs">
                  ({rule.aggregationType}{rule.parameterName ? `, parameter: ${rule.parameterName}` : ""})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
