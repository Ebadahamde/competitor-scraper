const ExcelJS =
  require("exceljs");

const fs =
  require("fs");

const path =
  require("path");

async function exportExcel(
  data,
  filePath
) {

  if (
    !data ||
    !data.length
  ) {
    return;
  }

  const dir =
    path.dirname(
      filePath
    );

  fs.mkdirSync(
    dir,
    {
      recursive: true
    }
  );

  const workbook =
    new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet(
      "Products"
    );

  const excelData =
    data.map(row => {

      const cleanRow =
        {};

      Object.entries(row)
        .forEach(
          ([key, value]) => {

            if (
              Array.isArray(
                value
              )
            ) {

              cleanRow[key] =
                value.join(
                  " | "
                );

            } else {

              cleanRow[key] =
                value;

            }

          }
        );

      return cleanRow;

    });

  worksheet.columns =
    Object.keys(
      excelData[0]
    ).map(key => ({
      header: key,
      key
    }));

  excelData.forEach(
    row => {

      worksheet.addRow(
        row
      );

    }
  );

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1
    }
  ];

  worksheet.autoFilter = {
    from: "A1",
    to: {
      row: 1,
      column:
        worksheet.columns.length
    }
  };

  worksheet.columns.forEach(
    column => {

      let maxLength =
        15;

      column.eachCell(
        {
          includeEmpty:
            true
        },
        cell => {

          const value =
            String(
              cell.value || ""
            );

          maxLength =
            Math.max(
              maxLength,
              value.length
            );

        }
      );

      column.width =
        Math.min(
          maxLength + 2,
          60
        );

    }
  );

  await workbook.xlsx.writeFile(
    filePath
  );

  console.log(
    `Excel Saved: ${filePath}`
  );

}

module.exports = {
  exportExcel
};