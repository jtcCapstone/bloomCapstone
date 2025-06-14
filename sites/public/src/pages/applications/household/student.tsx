import React, { useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import { FieldGroup, Form, t } from "@bloom-housing/ui-components"
import { CardSection } from "@bloom-housing/ui-seeds/src/blocks/Card"
import { Alert } from "@bloom-housing/ui-seeds"
import { OnClientSide, PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import styles from "../../../layouts/application-form.module.scss"
import { AssistantOpenButton } from "../../../components/assistant/types"
import Assistant from "../../../components/assistant/General/Assistant"

const ApplicationHouseholdStudent = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("householdStudent")
  const currentPageSection = 2
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, getValues, trigger } = useForm<Record<string, any>>({
    defaultValues: { householdStudent: application.householdStudent?.toString() },
    shouldFocusError: false,
  })

  const onSubmit = async (data) => {
    const validation = await trigger()
    if (!validation) return
    const { householdStudent } = data
    conductor.currentStep.save({
      householdStudent: householdStudent === "true",
    })
    conductor.completeSection(2)
    conductor.routeToNextOrReturnUrl()
  }

  const onError = () => {
    window.scrollTo(0, 0)
  }

  const householdStudentValues = [
    {
      id: "householdStudentYes",
      value: "true",
      label: t("t.yes"),
    },
    {
      id: "householdStudentNo",
      value: "false",
      label: t("t.no"),
    },
  ]

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Household Student",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <>
        {isChatbotOpen && (
          <Assistant
            isOpen={isChatbotOpen}
            onClose={() => {
              setIsChatbotOpen(false)
              setIsChatbotMinimized(false)
            }}
          />
        )}
        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <ApplicationFormLayout
            listingName={listing?.name}
            heading={
              <div className={styles["heading-with-assistant"]}>
                <h2>{t("application.household.householdStudent.question")}</h2>
                {!isChatbotOpen && !isChatbotMinimized && (
                  <AssistantOpenButton onClick={() => setIsChatbotOpen(true)} />
                )}
              </div>
            }
            subheading={t("application.household.genericSubtitle")}
            progressNavProps={{
              currentPageSection: currentPageSection,
              completedSections: application.completedSections,
              labels: conductor.config.sections.map((label) => t(`t.${label}`)),
              mounted: OnClientSide(),
            }}
            backLink={{
              url: conductor.determinePreviousUrl(),
            }}
            conductor={conductor}
          >
            {Object.entries(errors).length > 0 && (
              <Alert
                className={styles["message-inside-card"]}
                variant="alert"
                fullwidth
                id={"application-alert-box"}
              >
                {t("errors.errorsToResolve")}
              </Alert>
            )}
            <CardSection divider={"flush"} className={"border-none"}>
              <fieldset>
                <FieldGroup
                  fieldGroupClassName="grid grid-cols-1"
                  fieldClassName="ml-0"
                  type="radio"
                  name="householdStudent"
                  groupNote={t("t.pleaseSelectOne")}
                  error={errors.householdStudent}
                  errorMessage={t("errors.selectAnOption")}
                  register={register}
                  fields={householdStudentValues}
                  dataTestId={"app-student"}
                  validation={{
                    validate: () => {
                      return !!Object.values(getValues()).filter((value) => value).length
                    },
                  }}
                />
              </fieldset>
            </CardSection>
          </ApplicationFormLayout>
        </Form>
      </>
    </FormsLayout>
  )
}

export default ApplicationHouseholdStudent
