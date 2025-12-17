/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";

import { TGroupSelectOption, TSelectOption } from "@/components/custom/select/select.types";

import { getCellValue } from "./table.utils";

interface ITestRow {
  id: number;
  name: string;
}

describe("getCellValue 엣지 케이스", () => {
  describe("숫자 처리 엣지", () => {
    const cases = [
      { desc: "빈 문자열", expected: 0, input: "" },
      { desc: "음수 문자열", expected: -42, input: "-42" },
      { desc: "지수 표기", expected: 1000, input: "1e3" },
      { desc: "매우 큰 수", expected: Number.MAX_VALUE, input: Number.MAX_VALUE.toString() },
      { desc: "매우 작은 수", expected: Number.MIN_VALUE, input: Number.MIN_VALUE.toString() },
      { desc: "문자열 'NaN'", expected: 0, input: "NaN" },
    ] as const;

    it.each(cases)("inputType=number - $desc", ({ expected, input }) => {
      const result = getCellValue<ITestRow>({
        cellMeta: { inputType: "number" },
        pastedRowValue: input,
        rowData: { id: 1, name: "A" },
      });
      expect(result).toBe(expected);
    });
  });

  describe("불리언 처리 엣지", () => {
    const cases = [
      { desc: "대문자 true", expected: true, input: "TRUE" },
      { desc: "뒷공백 포함", expected: false, input: "false " },
      { desc: "true/false 아닌 값", expected: false, input: "yes" },
    ] as const;

    it.each(cases)("inputType=boolean - $desc", ({ expected, input }) => {
      const result = getCellValue<ITestRow>({
        cellMeta: { inputType: "boolean" },
        pastedRowValue: input.trim(), // trim은 호출 전처리 예시
        rowData: { id: 1, name: "A" },
      });
      expect(result).toBe(expected);
    });
  });

  describe("selectOptions 엣지", () => {
    it("함수형 옵션이 빈 배열 반환", () => {
      const optionsFn = () => [] as TSelectOption<unknown>[];
      const result = getCellValue<ITestRow>({
        cellMeta: { selectOptions: optionsFn },
        pastedRowValue: "anything",
        rowData: { id: 2, name: "B" },
      });
      expect(result).toBeUndefined();
    });

    it("중복된 라벨이 있을 때 첫 번째 값 반환", () => {
      const options = [
        { label: "dup", value: 1 },
        { label: "dup", value: 2 },
      ];
      const result = getCellValue<ITestRow>({
        cellMeta: { selectOptions: options },
        pastedRowValue: "dup",
        rowData: { id: 3, name: "C" },
      });
      expect(result).toBe(1);
    });

    it("숫자 값 옵션에 문자열이 match 안될 때 undefined", () => {
      const options = [{ label: "one", value: 1 }];
      const result = getCellValue<ITestRow>({
        cellMeta: { selectOptions: options },
        pastedRowValue: "2",
        rowData: { id: 4, name: "D" },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("groupSelectOptions 엣지", () => {
    const groups: TGroupSelectOption[] = [
      {
        label: "G1",
        options: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
      },
      {
        label: "G2",
        options: [{ label: "C", value: "c" }],
      },
    ];

    it("함수형 그룹 옵션이 빈 배열", () => {
      const groupsFn = () => [] as any[];
      const result = getCellValue<ITestRow>({
        cellMeta: { groupSelectOptions: groupsFn },
        pastedRowValue: "C",
        rowData: { id: 5, name: "E" },
      });
      expect(result).toBeUndefined();
    });

    it("라벨 매칭 대소문자/공백 무시", () => {
      const result = getCellValue<ITestRow>({
        cellMeta: { groupSelectOptions: groups },
        pastedRowValue: " a ",
        rowData: { id: 6, name: "F" },
      });
      expect(result).toBe("a");
    });
  });

  describe("기본 문자열 처리", () => {
    it("공백 문자열 그대로 반환", () => {
      const result = getCellValue<ITestRow>({
        pastedRowValue: "   ",
        rowData: { id: 7, name: "G" },
      });
      expect(result).toBe("   ");
    });

    it("옵션이 없는 숫자 유사 문자열 반환", () => {
      const result = getCellValue<ITestRow>({
        pastedRowValue: "007",
        rowData: { id: 8, name: "H" },
      });
      expect(result).toBe("007");
    });
  });
});
