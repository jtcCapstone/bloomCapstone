import React, { useContext, useEffect } from "react"
import { useForm } from "react-hook-form"
import { t, Form } from "@bloom-housing/ui-components"
import {
  OnClientSide,
  PageView,
  pushGtmEvent,
  AuthContext,
  listingSectionQuestions,
} from "@bloom-housing/shared-helpers"
import FormsLayout from "../../../layouts/forms"
import { useFormConductor } from "../../../lib/hooks"
import { UserStatus } from "../../../lib/constants"
import { MultiselectQuestionsApplicationSectionEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import ApplicationFormLayout from "../../../layouts/application-form"
import Assistant from "../../../components/assistant/General/Assistant"
import AssistantOpenButton from "../../../components/assistant/AssistantOpenButton"

const ApplicationPreferencesGeneral = () => {
  const { profile } = useContext(AuthContext)
  const { conductor, application, listing } = useFormConductor("generalPool")
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = React.useState(false)

  const currentPageSection = listingSectionQuestions(
    listing,
    MultiselectQuestionsApplicationSectionEnum.programs
  )?.length
    ? 5
    : 4

  const { handleSubmit } = useForm()
  const onSubmit = () => {
    conductor.completeSection(4)
    conductor.sync()
    conductor.routeToNextOrReturnUrl()
  }

  useEffect(() => {
    pushGtmEvent<PageView>({
      event: "pageView",
      pageTitle: "Application - General Preferences",
      status: profile ? UserStatus.LoggedIn : UserStatus.NotLoggedIn,
    })
  }, [profile])

  return (
    <FormsLayout>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ApplicationFormLayout
          listingName={listing?.name}
          heading={
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span>{t("application.preferences.general.title")}</span>
              {!isChatbotOpen && !isChatbotMinimized && (
                <AssistantOpenButton onClick={() => setIsChatbotOpen(true)} />
              )}
            </div>
          }
          subheading={t("application.preferences.general.preamble")}
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
          hideBorder={true}
        />

        {isChatbotOpen && (
          <Assistant
            isOpen={isChatbotOpen}
            onClose={() => {
              setIsChatbotOpen(false)
              setIsChatbotMinimized(false)
            }}
          />
        )}
      </Form>
    </FormsLayout>
  )
}

export default ApplicationPreferencesGeneral
