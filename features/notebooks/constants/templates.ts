import type { NotebookContent, NotebookExecutionProfile } from "@/features/notebooks/types";

type NotebookTemplate = {
  key: string;
  label: string;
  description: string;
  recommendedProfile: NotebookExecutionProfile;
  content: NotebookContent;
};

function createBaseMetadata(profile: NotebookExecutionProfile) {
  if (profile === "pyspark") {
    return {
      kernelspec: {
        display_name: "PySpark",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
      },
    };
  }

  if (profile === "sql_trino") {
    return {
      kernelspec: {
        display_name: "SQL / Trino",
        language: "sql",
        name: "sql",
      },
      language_info: {
        name: "sql",
      },
    };
  }

  return {
    kernelspec: {
      display_name: "Python 3",
      language: "python",
      name: "python3",
    },
    language_info: {
      name: "python",
    },
  };
}

export const NOTEBOOK_TEMPLATES: NotebookTemplate[] = [
  {
    key: "blank",
    label: "Blank Notebook",
    description: "Start from a clean notebook shell with no cells.",
    recommendedProfile: "python",
    content: {
      cells: [],
      metadata: createBaseMetadata("python"),
      nbformat: 4,
      nbformat_minor: 5,
    },
  },
  {
    key: "python-analysis",
    label: "Python Analysis",
    description: "Bootstrap an exploratory notebook with imports and a first analysis cell.",
    recommendedProfile: "python",
    content: {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: ["# Analysis Notebook\n", "Use this notebook for exploratory Python analysis.\n"],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "import pandas as pd\n",
            "import numpy as np\n",
            "\n",
            "# TODO: load your data source here\n",
          ],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "# Example transformation\n",
            "df = pd.DataFrame({\"value\": [1, 2, 3]})\n",
            "df.describe()\n",
          ],
        },
      ],
      metadata: createBaseMetadata("python"),
      nbformat: 4,
      nbformat_minor: 5,
    },
  },
  {
    key: "pyspark-job",
    label: "PySpark Job",
    description: "Start from a single-profile PySpark notebook ready for Spark job conversion.",
    recommendedProfile: "pyspark",
    content: {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: ["# PySpark Job Notebook\n", "Prepare reusable Spark transformations here.\n"],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "from pyspark.sql import SparkSession\n",
            "\n",
            "spark = SparkSession.builder.getOrCreate()\n",
          ],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "# TODO: replace with your source path\n",
            "df = spark.read.option(\"header\", True).csv(\"/path/to/source.csv\")\n",
            "df.printSchema()\n",
          ],
        },
      ],
      metadata: createBaseMetadata("pyspark"),
      nbformat: 4,
      nbformat_minor: 5,
    },
  },
  {
    key: "pyspark-titanic-iceberg-load",
    label: "Titanic Iceberg Load",
    description:
      "Bootstrap a PySpark notebook that inserts sample Titanic rows into iceberg.org2_mkadium_file_asset_public.titanic_1_csv and verifies the write.",
    recommendedProfile: "pyspark",
    content: {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            "# Titanic Iceberg Load\n",
            "\n",
            "Use this notebook to insert sample Titanic rows into `iceberg.org2_mkadium_file_asset_public.titanic_1_csv` with PySpark, then validate the written data.\n",
            "\n",
            "Suggested flow:\n",
            "1. Save notebook content\n",
            "2. Run the PySpark cells\n",
            "3. Convert the notebook into a Spark job\n",
            "4. Add a schedule under Linked Spark Jobs\n",
          ],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "from pyspark.sql import Row, SparkSession\n",
            "\n",
            "spark = SparkSession.builder.getOrCreate()\n",
            "target_table = \"iceberg.org2_mkadium_file_asset_public.titanic_1_csv\"\n",
            "target_columns = [\n",
            "    \"Passengerid\",\n",
            "    \"Survived\",\n",
            "    \"Pclass\",\n",
            "    \"Name\",\n",
            "    \"Sex\",\n",
            "    \"Age\",\n",
            "    \"Sibsp\",\n",
            "    \"Parch\",\n",
            "    \"Ticket\",\n",
            "    \"Fare\",\n",
            "    \"Cabin\",\n",
            "    \"Embarked\",\n",
            "]\n",
            "\n",
            "sample_rows = [\n",
            "    Row(Passengerid=9001, Survived=0, Pclass=3, Name=\"Braund, Mr. Owen Harris\", Sex=\"male\", Age=22.0, Sibsp=1, Parch=0, Ticket=\"A/5 21171\", Fare=7.25, Cabin=None, Embarked=\"S\"),\n",
            "    Row(Passengerid=9002, Survived=1, Pclass=1, Name=\"Cumings, Mrs. John Bradley\", Sex=\"female\", Age=38.0, Sibsp=1, Parch=0, Ticket=\"PC 17599\", Fare=71.2833, Cabin=\"C85\", Embarked=\"C\"),\n",
            "    Row(Passengerid=9003, Survived=1, Pclass=3, Name=\"Heikkinen, Miss. Laina\", Sex=\"female\", Age=26.0, Sibsp=0, Parch=0, Ticket=\"STON/O2. 3101282\", Fare=7.925, Cabin=None, Embarked=\"S\"),\n",
            "]\n",
            "\n",
            "sample_df = spark.createDataFrame(sample_rows).select(*target_columns)\n",
            "sample_df.show(truncate=False)\n",
          ],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "# Append sample records to the Iceberg table.\n",
            "sample_df.write.mode(\"append\").saveAsTable(target_table)\n",
            "print(f\"Inserted {sample_df.count()} sample rows into {target_table}\")\n",
          ],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "# Validate the latest records.\n",
            "verification_df = (\n",
            "    spark.table(target_table)\n",
            "    .where(\"Passengerid >= 9001\")\n",
            "    .orderBy(\"Passengerid\")\n",
            ")\n",
            "\n",
            "print(f\"Verification row count: {verification_df.count()}\")\n",
            "verification_df.show(truncate=False)\n",
          ],
        },
      ],
      metadata: createBaseMetadata("pyspark"),
      nbformat: 4,
      nbformat_minor: 5,
    },
  },
  {
    key: "sql-trino",
    label: "SQL / Trino Exploration",
    description: "Start from SQL-oriented cells for catalog exploration and profiling.",
    recommendedProfile: "sql_trino",
    content: {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: ["# SQL Exploration\n", "Use this notebook for Trino-backed analysis.\n"],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: ["SHOW SCHEMAS FROM iceberg;\n"],
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: ["SELECT * FROM schema.table LIMIT 100;\n"],
        },
      ],
      metadata: createBaseMetadata("sql_trino"),
      nbformat: 4,
      nbformat_minor: 5,
    },
  },
];

export const NOTEBOOK_CODE_SNIPPETS: Array<{
  key: string;
  label: string;
  profile: NotebookExecutionProfile | "all";
  code: string;
}> = [
  {
    key: "python-imports",
    label: "Python imports",
    profile: "python",
    code: "import pandas as pd\nimport numpy as np\n\n",
  },
  {
    key: "python-chart",
    label: "Python quick chart",
    profile: "python",
    code: "import matplotlib.pyplot as plt\n\ndf.plot()\nplt.show()\n",
  },
  {
    key: "pyspark-read",
    label: "PySpark CSV read",
    profile: "pyspark",
    code: "df = spark.read.option(\"header\", True).csv(\"/path/to/source.csv\")\ndf.show(20, truncate=False)\n",
  },
  {
    key: "pyspark-write",
    label: "PySpark parquet write",
    profile: "pyspark",
    code: "df.write.mode(\"overwrite\").parquet(\"/path/to/output\")\n",
  },
  {
    key: "pyspark-titanic-iceberg-insert",
    label: "PySpark Titanic Iceberg insert",
    profile: "pyspark",
    code:
      "from pyspark.sql import Row\n\n"
      + "target_table = \"iceberg.org2_mkadium_file_asset_public.titanic_1_csv\"\n"
      + "sample_rows = [\n"
      + "    Row(Passengerid=9001, Survived=0, Pclass=3, Name=\"Braund, Mr. Owen Harris\", Sex=\"male\", Age=22.0, Sibsp=1, Parch=0, Ticket=\"A/5 21171\", Fare=7.25, Cabin=None, Embarked=\"S\"),\n"
      + "    Row(Passengerid=9002, Survived=1, Pclass=1, Name=\"Cumings, Mrs. John Bradley\", Sex=\"female\", Age=38.0, Sibsp=1, Parch=0, Ticket=\"PC 17599\", Fare=71.2833, Cabin=\"C85\", Embarked=\"C\"),\n"
      + "]\n\n"
      + "spark.createDataFrame(sample_rows).write.mode(\"append\").saveAsTable(target_table)\n",
  },
  {
    key: "sql-preview",
    label: "SQL table preview",
    profile: "sql_trino",
    code: "SELECT *\nFROM schema.table\nLIMIT 100;\n",
  },
  {
    key: "sql-profile",
    label: "SQL profile query",
    profile: "sql_trino",
    code: "SELECT COUNT(*) AS row_count\nFROM schema.table;\n",
  },
  {
    key: "markdown-section",
    label: "Markdown section",
    profile: "all",
    code: "# Section Title\n\nWrite your notes here.\n",
  },
];
