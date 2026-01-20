import type { Validator } from "@tanstack/form-core";
import { zodValidator } from "@tanstack/zod-form-adapter";
import type { ZodTypeAny } from "zod";

export const zodFormValidator = <TFormValues>() =>
  zodValidator() as Validator<TFormValues, ZodTypeAny>;
