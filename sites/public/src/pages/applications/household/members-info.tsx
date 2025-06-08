import React, { useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/router"
import { Form, t } from "@bloom-housing/ui-components"
import { Alert } from "@bloom-housing/ui-seeds"
import { OnClientSide, PageView, pushGtmEvent, AuthContext } from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import ApplicationFormLayout from "../../../layouts/application-form"
import styles from "../../../layouts/application-form.module.scss"
import { AssistantOpenButton } from "../../../components/assistant/types"
import Assistant from "../../../components/assistant/General/Assistant"

const ApplicationMembersInfo = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("householdMemberInfo")
  const router = useRouter()
  const currentPageSection = 2
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = React.useState(false)

  const { handleSubmit, errors } = useForm({
    shouldFocusError: false,
  })
  const onSubmit = () => {
    void router.push("/applications/household/add-members")
  }

  const onError = () => {
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - Household Member Info",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <>
      {isChatbotOpen && (
        <Assistant
          isOpen={isChatbotOpen}
          onClose={() => {
            setIsChatbotOpen(false)
            setIsChatbotMinimized(true)
          }}
        />
      )}

      {isChatbotMinimized && (
        <button
          type="button"
          className={styles["assistant-reopen-button"]}
          onClick={() => {
            setIsChatbotOpen(true)
            setIsChatbotMinimized(false)
          }}
        >
          💬 Assistant Help - Click to Reopen
        </button>
      )}

      <FormsLayout>
        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <ApplicationFormLayout
            listingName={listing?.name}
            heading={
              <div className={styles["heading-with-assistant"]}>
                <h2>{t("application.household.membersInfo.title")}</h2>
                {!isChatbotOpen && !isChatbotMinimized && (
                  <AssistantOpenButton
                    onClick={() => {
                      setIsChatbotOpen(true)
                      setIsChatbotMinimized(false)
                    }}
                  />
                )}
              </div>
            }
            progressNavProps={{
              currentPageSection: currentPageSection,
              completedSections: application.completedSections,
              labels: conductor.config.sections.map((label) => t(`t.${label}`)),
              mounted: OnClientSide(),
            }}
            conductor={conductor}
            backLink={{
              url: conductor.determinePreviousUrl(),
            }}
            hideBorder={true}
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
          </ApplicationFormLayout>
        </Form>
      </FormsLayout>
    </>
  )
}

export default ApplicationMembersInfo
