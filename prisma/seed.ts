const prismaModule = require("@prisma/client");

const prisma = new prismaModule.PrismaClient();

(async () => {
  const [bms, iet] = await prisma.$transaction([
    prisma.area.create({
      data: {
        name: "Berufsmaturität",
        routeName: "bms",
      },
    }),
    prisma.area.create({
      data: {
        name: "IET",
        routeName: "iet",
      },
    }),
  ]);

  function genCharArray(startChar: string, endChar: string) {
    const array = [];
    let i = startChar.charCodeAt(0);
    const j = endChar.charCodeAt(0);
    for (; i <= j; ++i) {
      array.push(String.fromCharCode(i));
    }
    return array;
  }

  const bmsClasses = await prisma.$transaction(
    (() => {
      const classes = [];
      const letters = genCharArray("a", "e");
      for (let i = 2019; i < 2023; i++) {
        for (const letter of letters) {
          classes.push(
            prisma.class.create({
              data: {
                name: `BM1TALS.I${i}${letter}`,
                areaId: bms.id,
                routeName: `bm1tals-i${i}${letter}`,
              },
            })
          );
        }
      }
      return classes;
    })()
  );

  const infClasses = await prisma.$transaction(
    (() => {
      const classes = [];
      const letters = genCharArray("a", "g");
      for (let i = 2019; i < 2023; i++) {
        for (const letter of letters) {
          classes.push(
            prisma.class.create({
              data: {
                name: `Inf${i}${letter}`,
                areaId: iet.id,
                routeName: `inf${i}${letter}`,
              },
            })
          );
        }
      }
      return classes;
    })()
  );

  const subjects = await prisma.$transaction(
    (
      [
        ["Deutsch", "Book2", "deutsch"],
        ["Physik", "", "physik"],
        ["Mathematik", "Math", "mathematik"],
        ["Englisch", "Language", "englisch"],
        ["Französisch", "Baguette", "französisch"],
        ["Geschichte", "BuildingMonument", "geschichte"],
        ["Wirtschaft & Recht", "ChartLine", "wirtschaft-recht"],
        ["Sport", "PlayFootball", "sport"],
        ["Chemie", "Flask", "chemie"],
      ] as const
    ).map(([name, icon, routeName]) =>
      prisma.subject.create({
        data: {
          name,
          icon,
          routeName,
        },
      })
    )
  );

  const [semesterSpring2023, semesterAutomn2023, semesterSpring2024] =
    await prisma.$transaction([
      prisma.timeSpan.create({
        data: {
          name: "Frühlingssemester 2023",
          start: new Date("2023-01-30"),
          end: new Date("2023-06-30"),
        },
      }),
      prisma.timeSpan.create({
        data: {
          name: "Herbstsemester 2023",
          start: new Date("2023-08-14"),
          end: new Date("2024-01-26"),
        },
      }),
      prisma.timeSpan.create({
        data: {
          name: "Frühlingssemester 2024",
          start: new Date("2024-01-29"),
          end: new Date("2024-06-28"),
        },
      }),
    ]);

  const [spring2023, spring2023BmsEnd] = await prisma.$transaction([
    prisma.planTemplate.create({
      data: {
        name: "Standardvorlage",
        description: "Die Standardvorlage enthält alle Feier- und Ferientage.",
        timeSpanId: semesterSpring2023.id,
        isDraft: false,
        appointments: {
          create: [
            {
              start: new Date("2023-04-03"),
              end: new Date("2023-04-22"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Osterferien",
                },
              },
            },
            {
              start: new Date("2023-07-03"),
              end: new Date("2023-08-12"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Sommerferien",
                },
              },
            },
            {
              start: new Date("2023-04-06T16:00:00.000Z"),
              end: new Date("2023-04-06T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Gründonnerstag",
                },
              },
            },
            {
              start: new Date("2023-05-17T16:00:00.000Z"),
              end: new Date("2023-05-17T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Tag vor Auffahrt",
                },
              },
            },
            {
              start: new Date("2023-04-07"),
              end: new Date("2023-04-07"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Karfreitag",
                },
              },
            },
            {
              start: new Date("2023-05-18"),
              end: new Date("2023-05-20"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Auffahrt",
                },
              },
            },
            {
              start: new Date("2023-04-08"),
              end: new Date("2023-04-08"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostersamstag",
                },
              },
            },
            {
              start: new Date("2023-04-10"),
              end: new Date("2023-04-10"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostermontag",
                },
              },
            },
            {
              start: new Date("2023-05-29"),
              end: new Date("2023-05-29"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Pfingstmontag",
                },
              },
            },
          ],
        },
      },
    }),
    prisma.planTemplate.create({
      data: {
        name: "Vorlage BMS Teil- / Abschlussklassen",
        description:
          "Die Vorlage enthält alle Feier- und Ferientage für BMS Teil- / Abschlussklassen.",
        timeSpanId: semesterSpring2023.id,
        isDraft: false,
        areaId: bms.id,
        appointments: {
          create: [
            {
              start: new Date("2023-04-03"),
              end: new Date("2023-04-22"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Osterferien",
                },
              },
            },
            {
              start: new Date("2023-07-10"),
              end: new Date("2023-08-12"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Sommerferien",
                },
              },
            },
            {
              start: new Date("2023-04-06T16:00:00.000Z"),
              end: new Date("2023-04-06T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Gründonnerstag",
                },
              },
            },
            {
              start: new Date("2023-05-17T16:00:00.000Z"),
              end: new Date("2023-05-17T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Tag vor Auffahrt",
                },
              },
            },
            {
              start: new Date("2023-04-07"),
              end: new Date("2023-04-07"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Karfreitag",
                },
              },
            },
            {
              start: new Date("2023-05-18"),
              end: new Date("2023-05-20"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Auffahrt",
                },
              },
            },
            {
              start: new Date("2023-04-08"),
              end: new Date("2023-04-08"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostersamstag",
                },
              },
            },
            {
              start: new Date("2023-04-10"),
              end: new Date("2023-04-10"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostermontag",
                },
              },
            },
            {
              start: new Date("2023-05-29"),
              end: new Date("2023-05-29"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Pfingstmontag",
                },
              },
            },
          ],
        },
      },
    }),
  ]);

  const [automn2023] = await prisma.$transaction([
    prisma.planTemplate.create({
      data: {
        name: "Standardvorlage",
        description: "Die Standardvorlage enthält alle Feier- und Ferientage.",
        timeSpanId: semesterAutomn2023.id,
        isDraft: false,
        appointments: {
          create: [
            {
              start: new Date("2023-08-01"),
              end: new Date("2023-08-12"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Sommerferien",
                },
              },
            },
            {
              start: new Date("2023-09-25"),
              end: new Date("2023-10-15"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Herbstferien",
                },
              },
            },
            {
              start: new Date("2023-12-25"),
              end: new Date("2024-01-07"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Weihnachtsferien",
                },
              },
            },
            {
              start: new Date("2023-11-27T16:00:00.000Z"),
              end: new Date("2023-11-27T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Zibelemärit",
                },
              },
            },
          ],
        },
      },
    }),
  ]);

  const [spring2024, spring2024BmsEnd] = await prisma.$transaction([
    prisma.planTemplate.create({
      data: {
        name: "Standardvorlage",
        description: "Die Standardvorlage enthält alle Feier- und Ferientage.",
        timeSpanId: semesterSpring2024.id,
        isDraft: false,
        appointments: {
          create: [
            {
              start: new Date("2024-04-01"),
              end: new Date("2024-04-21"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Osterferien",
                },
              },
            },
            {
              start: new Date("2024-07-01"),
              end: new Date("2024-08-11"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Sommerferien",
                },
              },
            },
            {
              start: new Date("2024-03-28T16:00:00.000Z"),
              end: new Date("2024-03-28T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Gründonnerstag",
                },
              },
            },
            {
              start: new Date("2024-05-08T16:00:00.000Z"),
              end: new Date("2024-05-08T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Tag vor Auffahrt",
                },
              },
            },
            {
              start: new Date("2024-03-29"),
              end: new Date("2024-03-29"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Karfreitag",
                },
              },
            },
            {
              start: new Date("2024-05-09"),
              end: new Date("2024-05-11"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Auffahrt",
                },
              },
            },
            {
              start: new Date("2024-05-20"),
              end: new Date("2024-05-20"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Pfingstmontag",
                },
              },
            },
            {
              start: new Date("2024-03-30"),
              end: new Date("2024-03-30"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostersamstag",
                },
              },
            },
            {
              start: new Date("2024-04-01"),
              end: new Date("2024-04-01"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostermontag",
                },
              },
            },
          ],
        },
      },
    }),
    prisma.planTemplate.create({
      data: {
        name: "Vorlage BMS Teil- / Abschlussklassen",
        description:
          "Die Vorlage enthält alle Feier- und Ferientage für BMS Teil- / Abschlussklassen.",
        timeSpanId: semesterSpring2024.id,
        isDraft: false,
        areaId: bms.id,
        appointments: {
          create: [
            {
              start: new Date("2024-04-01"),
              end: new Date("2024-04-21"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Osterferien",
                },
              },
            },
            {
              start: new Date("2024-07-08"),
              end: new Date("2024-08-11"),
              type: "vacation",
              vacationAppointments: {
                create: {
                  name: "Sommerferien",
                },
              },
            },
            {
              start: new Date("2024-03-28T16:00:00.000Z"),
              end: new Date("2024-03-28T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Gründonnerstag",
                },
              },
            },
            {
              start: new Date("2024-05-08T16:00:00.000Z"),
              end: new Date("2024-05-08T23:59:59.999Z"),
              type: "early",
              earlydayAppointments: {
                create: {
                  name: "Tag vor Auffahrt",
                },
              },
            },
            {
              start: new Date("2024-03-29"),
              end: new Date("2024-03-29"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Karfreitag",
                },
              },
            },
            {
              start: new Date("2024-05-09"),
              end: new Date("2024-05-11"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Auffahrt",
                },
              },
            },
            {
              start: new Date("2024-05-20"),
              end: new Date("2024-05-20"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Pfingstmontag",
                },
              },
            },
            {
              start: new Date("2024-03-30"),
              end: new Date("2024-03-30"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostersamstag",
                },
              },
            },
            {
              start: new Date("2024-04-01"),
              end: new Date("2024-04-01"),
              type: "holiday",
              holidayAppointments: {
                create: {
                  name: "Ostermontag",
                },
              },
            },
          ],
        },
      },
    }),
  ]);
})();
