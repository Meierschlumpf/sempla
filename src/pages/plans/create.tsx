import { Button, Center, Container, Stepper } from "@mantine/core";
import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Layout } from "~/components/layout/layout";
import { PlanFirstStepForm } from "~/components/plan/create/first-step";
import { PlanSecondStepForm } from "~/components/plan/create/second-step";
import { createSsgHelper } from "~/helpers/createSsgHelper";

const Page: NextPage<{
  draftPlanId: string | null;
}> = ({ draftPlanId }) => {
  const [active, setActive] = useState(0);
  const [planId, setPlanId] = useState<string | null>(draftPlanId ?? null);
  const [templateId, setTemplateId] = useState<string | null>(null);

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
              <Center>
                <Button onClick={() => setActive((a) => a + 1)}>Next</Button>
              </Center>
            </Stepper.Step>
            <Stepper.Completed>
              Completed, click back button to get to previous step
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
    },
  };
};
