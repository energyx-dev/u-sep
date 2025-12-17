import { Meta } from "@storybook/react";
import { useState } from "react";

import { mockExcelTableData } from "@/stories/ExcelLikeTable/mock.utils";
import { TestTable } from "@/stories/ExcelLikeTable/TestTable";

const meta = {
  component: TestTable,
  title: "page-test/TestTable",
} satisfies Meta<typeof TestTable>;

export default meta;

export const Example = () => {
  const [data, setData] = useState(mockExcelTableData.data);
  const columns = mockExcelTableData.columns;

  return (
    <div className="mt-5">
      <p className="font-bold">다음과 같은 기능을 사용할 수 있습니다.</p>

      <ul className="mt-2 list-disc pl-5">
        <li>영역을 선택하여 복사(Ctrl+C)하거나 붙여넣기(Ctrl+V)가 가능합니다.</li>
        <li>Enter 키 또는 셀 더블클릭으로 셀을 편집할 수 있습니다.</li>
        <li>화살표 키나 Tab 키로 셀 간 이동이 가능합니다.</li>
        <li>편집 중에는 Enter 키로 저장할 수 있습니다.</li>
      </ul>

      <div className="mt-5">
        <TestTable columns={columns} data={data} onDataChange={setData} pageSize={5} />
      </div>
    </div>
  );
};
