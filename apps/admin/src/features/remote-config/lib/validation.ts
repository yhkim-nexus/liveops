import { z } from "zod";

// Key pattern: lowercase, numbers, dots, underscores, hyphens. 1-256 chars.
const keyPattern = /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/;
// Single char keys are also valid
const singleCharPattern = /^[a-z0-9]$/;

export const remoteConfigFormSchema = z
  .object({
    key: z
      .string()
      .min(1, "키를 입력해주세요.")
      .max(256, "키는 256자 이하여야 합니다.")
      .refine(
        (v) => singleCharPattern.test(v) || keyPattern.test(v),
        "키는 소문자 영문, 숫자, 점(.), 밑줄(_), 하이픈(-)만 사용할 수 있습니다.",
      ),
    description: z.string().optional().default(""),
    target: z.enum(["client", "server", "both"], {
      message: "적용 대상을 선택해주세요.",
    }),
    valueType: z.enum(["string", "number", "boolean", "json"], {
      message: "값 타입을 선택해주세요.",
    }),
    value: z.string().min(1, "값을 입력해주세요."),
    tags: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    // Type-dependent value validation
    if (data.valueType === "number") {
      if (isNaN(Number(data.value))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "유효한 숫자를 입력해주세요.",
          path: ["value"],
        });
      }
    } else if (data.valueType === "boolean") {
      if (data.value !== "true" && data.value !== "false") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "true 또는 false만 입력 가능합니다.",
          path: ["value"],
        });
      }
    } else if (data.valueType === "json") {
      try {
        JSON.parse(data.value);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "유효한 JSON 형식이 아닙니다.",
          path: ["value"],
        });
      }
    }
  });

export type RemoteConfigFormData = z.infer<typeof remoteConfigFormSchema>;
