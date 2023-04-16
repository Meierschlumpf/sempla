import { Container, Stack, Stepper, Text, Title } from "@mantine/core";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Layout } from "~/components/layout/layout";
import { PlanFirstStepForm } from "~/components/plan/create/first-step";
import { PlanLastStepForm } from "~/components/plan/create/last-step";
import { PlanSecondStepForm } from "~/components/plan/create/second-step";
import { createSsgHelper } from "~/helpers/createSsgHelper";

const Page: NextPage<{
  draftPlanId: string | null;
  draftTemplateId: string | null;
}> = ({ draftPlanId, draftTemplateId }) => {
  const [active, setActive] = useState(0);
  const [planId, setPlanId] = useState<string | null>(draftPlanId);
  const [templateId, setTemplateId] = useState<string | null>(draftTemplateId);

  return (
    <>
      <Head>
        <title>Plan erstellen</title>
      </Head>
      <Layout>
        <Container>
          <Stepper
            active={active}
            breakpoint="sm"
            onStepClick={setActive}
            allowNextStepsSelect={false}
          >
            <Stepper.Step
              label="Erster Schritt"
              description="Grundlagen definieren"
            >
              <PlanFirstStepForm
                nextSteep={() => setActive(1)}
                planId={planId}
                setPlanId={setPlanId}
              />
            </Stepper.Step>
            <Stepper.Step
              label="Zweiter Schritt"
              description="Vorlage auswählen"
            >
              <PlanSecondStepForm
                nextSteep={() => setActive(2)}
                planId={planId!}
                setTemplateId={setTemplateId}
                templateId={templateId}
              />
            </Stepper.Step>
            <Stepper.Step
              label="Letzter Schritt"
              description="Themen definieren"
            >
              <PlanLastStepForm
                planId={planId!}
                nextStep={() => setActive(3)}
              />
            </Stepper.Step>
            <Stepper.Completed>
              <Stack align="center">
                <Title>Der Plan wurde erfolgreich erstellt.</Title>
                <Text>Du wirst gleich weitergeleitet...</Text>
              </Stack>
            </Stepper.Completed>
          </Stepper>
        </Container>
      </Layout>
    </>
  );
};

export default Page;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const ssg = await createSsgHelper(context);

  const draft = await ssg.plan.draft.fetch();

  await ssg.timeSpan.all.prefetch();
  await ssg.area.me.prefetch();

  if (draft) {
    await ssg.plan.byId.prefetch({ id: draft.id });
    await ssg.class.byAreaId.prefetch({ areaId: draft.areaId });
    await ssg.subject.available.prefetch({
      areaId: draft.areaId,
      classId: draft.classId,
      timeSpanId: draft.timeSpanId,
    });
  }

  return {
    props: {
      trpcState: ssg.dehydrate(),
      draftPlanId: draft?.id ?? null,
      draftTemplateId: draft?.templateId ?? null,
    },
  };
};
