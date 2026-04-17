"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useProperties,
  useCreateProperty,
  useDeleteProperty,
} from "@/features/segments/hooks/use-segment-queries";
import type { PropertyValueType } from "@/features/segments/types/segment";

type PropertyTab = "default" | "computed" | "custom";

const TAB_CONFIG: { key: PropertyTab; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "computed", label: "Computed" },
  { key: "custom", label: "Custom" },
];

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState<PropertyTab>("default");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<PropertyValueType>("string");
  const [newDescription, setNewDescription] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const { data: properties, isLoading } = useProperties(activeTab);
  const createMutation = useCreateProperty();
  const deleteMutation = useDeleteProperty();

  const handleCreate = () => {
    if (!newKey.trim() || !newLabel.trim()) return;
    createMutation.mutate(
      {
        key: newKey.trim(),
        label: newLabel.trim(),
        valueType: newType,
        description: newDescription.trim(),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewKey("");
          setNewLabel("");
          setNewType("string");
          setNewDescription("");
        },
      },
    );
  };

  const handleDelete = (key: string) => {
    if (!confirm(`'${key}' 속성을 삭제하시겠습니까?`)) return;
    deleteMutation.mutate(key);
  };

  const keyPattern = /^[a-z0-9_]{1,64}$/;
  const isKeyValid = keyPattern.test(newKey);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">속성 관리</h2>
        {activeTab === "custom" && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              속성 추가
            </Button>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
              <DialogHeader>
                <DialogTitle>Custom 속성 추가</DialogTitle>
                <DialogDescription>
                  새로운 사용자 정의 속성을 생성합니다. 키는 영문
                  소문자, 숫자, 언더스코어만 사용 가능합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="prop-key">키 *</Label>
                  <Input
                    id="prop-key"
                    placeholder="예: player_level"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                  {newKey && !isKeyValid && (
                    <p className="text-xs text-destructive">
                      키 이름은 영문 소문자, 숫자, 언더스코어만 사용할 수
                      있습니다. (1~64자)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-label">표시명 *</Label>
                  <Input
                    id="prop-label"
                    placeholder="예: 플레이어 레벨"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-type">타입</Label>
                  <Select
                    value={newType}
                    onValueChange={(v) => {
                      if (v) setNewType(v as PropertyValueType);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="numeric">Numeric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-desc">설명</Label>
                  <Input
                    id="prop-desc"
                    placeholder="속성에 대한 설명"
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
                !isKeyValid ||
                !newLabel.trim() ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? "생성 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-muted-foreground">속성이 없습니다.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>키</TableHead>
                  <TableHead>표시명</TableHead>
                  <TableHead>타입</TableHead>
                  {activeTab === "computed" && (
                    <>
                      <TableHead>소스 이벤트</TableHead>
                      <TableHead>집계 방식</TableHead>
                      <TableHead>파라미터</TableHead>
                    </>
                  )}
                  <TableHead>설명</TableHead>
                  {activeTab === "custom" && (
                    <TableHead className="w-[1%]" />
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((prop) => (
                  <TableRow key={prop.key}>
                    <TableCell className="font-mono text-sm">
                      {prop.key}
                    </TableCell>
                    <TableCell className="font-medium">
                      {prop.label}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {prop.valueType}
                      </span>
                    </TableCell>
                    {activeTab === "computed" && (
                      <>
                        <TableCell className="text-sm text-muted-foreground">
                          {prop.computedRule?.eventName ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {prop.computedRule?.aggregation ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {prop.computedRule?.parameterName ?? "-"}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="max-w-64 truncate text-muted-foreground text-sm">
                      {prop.description}
                    </TableCell>
                    {activeTab === "custom" && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prop.key)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
