"use client";

import { ApplicationData } from "@/types";

interface SoftwareExperienceSectionProps {
  application: ApplicationData;
}

export default function SoftwareExperienceSection({
  application,
}: SoftwareExperienceSectionProps) {
  const softwareCategories = [
    {
      category: "Desain Grafis",
      icon: "🎨",
      color: "purple",
      software: [
        {
          key: "corelDraw",
          name: "CorelDraw",
          description: "Desain vektor dan grafis",
        },
        {
          key: "photoshop",
          name: "Adobe Photoshop",
          description: "Edit foto dan raster",
        },
      ],
    },
    {
      category: "Video & Multimedia",
      icon: "🎬",
      color: "red",
      software: [
        {
          key: "adobePremierePro",
          name: "Adobe Premiere Pro",
          description: "Edit video profesional",
        },
        {
          key: "adobeAfterEffect",
          name: "Adobe After Effects",
          description: "Motion graphics dan VFX",
        },
      ],
    },
    {
      category: "Pengembangan Software",
      icon: "💻",
      color: "blue",
      software: [
        {
          key: "androidStudio",
          name: "Android Studio",
          description: "Pengembangan aplikasi Android",
        },
        {
          key: "visualStudio",
          name: "Visual Studio",
          description: "IDE untuk pengembangan software",
        },
      ],
    },
    {
      category: "Elektronika & Robotika",
      icon: "🤖",
      color: "green",
      software: [
        {
          key: "autodeskEagle",
          name: "Autodesk Eagle",
          description: "Desain PCB dan elektronik",
        },
        {
          key: "arduinoIde",
          name: "Arduino IDE",
          description: "Programming mikrokontroller",
        },
        {
          key: "missionPlaner",
          name: "Mission Planner",
          description: "Software untuk drone/UAV",
        },
      ],
    },
    {
      category: "CAD & Engineering",
      icon: "📐",
      color: "orange",
      software: [
        {
          key: "autodeskInventor",
          name: "Autodesk Inventor",
          description: "CAD 3D dan simulasi",
        },
        {
          key: "autodeskAutocad",
          name: "AutoCAD",
          description: "Desain teknik 2D/3D",
        },
        {
          key: "solidworks",
          name: "SolidWorks",
          description: "CAD 3D engineering",
        },
      ],
    },
  ];

  const getColorClasses = (
    color: string,
    variant: "bg" | "border" | "text"
  ) => {
    const colors = {
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800",
      },
    };
    return colors[color as keyof typeof colors]?.[variant] || "bg-gray-50";
  };

  // Count total software experience
  const totalSoftware = softwareCategories.reduce(
    (total, category) => total + category.software.length,
    0
  );

  const experiencedSoftware = softwareCategories.reduce(
    (total, category) =>
      total +
      category.software.filter(
        (sw) =>
          application.software?.[sw.key as keyof typeof application.software]
      ).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-purple-800">
                Pengalaman Software
              </h3>
              <p className="text-sm text-purple-600">
                Keahlian software dan teknologi yang dikuasai
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-purple-700">
              {experiencedSoftware}/{totalSoftware}
            </div>
            <div className="text-xs text-purple-600">Software dikuasai</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">
              Tingkat Pengalaman Software
            </span>
            <span className="text-sm text-purple-600">
              {Math.round((experiencedSoftware / totalSoftware) * 100)}%
            </span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(experiencedSoftware / totalSoftware) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Software Categories */}
      <div className="space-y-6">
        {softwareCategories.map((category, categoryIndex) => {
          const categoryExperience = category.software.filter(
            (sw) =>
              application.software?.[
                sw.key as keyof typeof application.software
              ]
          ).length;

          return (
            <div
              key={categoryIndex}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Category Header */}
              <div
                className={`${getColorClasses(
                  category.color,
                  "bg"
                )} ${getColorClasses(category.color, "border")} p-4 border-b`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4
                        className={`font-semibold text-lg ${getColorClasses(
                          category.color,
                          "text"
                        )}`}
                      >
                        {category.category}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {categoryExperience} dari {category.software.length}{" "}
                        software dikuasai
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${getColorClasses(
                        category.color,
                        "text"
                      )}`}
                    >
                      {Math.round(
                        (categoryExperience / category.software.length) * 100
                      )}
                      %
                    </div>
                  </div>
                </div>

                {/* Category Progress */}
                <div className="mt-3">
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        category.color === "purple"
                          ? "bg-purple-600"
                          : category.color === "red"
                          ? "bg-red-600"
                          : category.color === "blue"
                          ? "bg-blue-600"
                          : category.color === "green"
                          ? "bg-green-600"
                          : "bg-orange-600"
                      }`}
                      style={{
                        width: `${
                          (categoryExperience / category.software.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Software List */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.software.map((software, softwareIndex) => {
                    const hasExperience =
                      application.software?.[
                        software.key as keyof typeof application.software
                      ];

                    return (
                      <div
                        key={softwareIndex}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          hasExperience
                            ? `${getColorClasses(
                                category.color,
                                "bg"
                              )} ${getColorClasses(category.color, "border")}`
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              hasExperience
                                ? category.color === "purple"
                                  ? "bg-purple-500"
                                  : category.color === "red"
                                  ? "bg-red-500"
                                  : category.color === "blue"
                                  ? "bg-blue-500"
                                  : category.color === "green"
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <h5
                              className={`font-medium text-sm ${
                                hasExperience
                                  ? getColorClasses(category.color, "text")
                                  : "text-gray-500"
                              }`}
                            >
                              {software.name}
                            </h5>
                            <p className="text-xs text-gray-500 truncate">
                              {software.description}
                            </p>
                          </div>
                          <div>
                            {hasExperience ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ${
                                  category.color === "purple"
                                    ? "text-purple-600"
                                    : category.color === "red"
                                    ? "text-red-600"
                                    : category.color === "blue"
                                    ? "text-blue-600"
                                    : category.color === "green"
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Software */}
      {application.software?.others && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <span className="text-xl">🔧</span>
            Software Lainnya
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 leading-relaxed">
              {application.software.others}
            </p>
          </div>
        </div>
      )}

      {/* Experience Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4">
          Ringkasan Pengalaman
        </h4>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 leading-relaxed">
            <span className="font-semibold">{application.fullName}</span>{" "}
            memiliki pengalaman dengan{" "}
            <span className="font-bold">{experiencedSoftware}</span> dari{" "}
            <span className="font-bold">{totalSoftware}</span> software yang
            tercantum ({Math.round((experiencedSoftware / totalSoftware) * 100)}
            % tingkat pengalaman).
            {experiencedSoftware > 0 ? (
              <>
                {" "}
                Ini menunjukkan{" "}
                {experiencedSoftware >= totalSoftware * 0.8
                  ? "pengalaman yang sangat luas"
                  : experiencedSoftware >= totalSoftware * 0.6
                  ? "pengalaman yang baik"
                  : experiencedSoftware >= totalSoftware * 0.4
                  ? "pengalaman yang cukup"
                  : "pengalaman dasar"}{" "}
                dalam berbagai kategori software.
              </>
            ) : (
              " Pendaftar belum mengisi pengalaman software."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
