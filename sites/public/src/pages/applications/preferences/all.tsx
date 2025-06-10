import React from "react"
import { t } from "@bloom-housing/ui-components"
import { listingSectionQuestions } from "@bloom-housing/shared-helpers"
import ApplicationMultiselectQuestionStep from "../../../components/applications/ApplicationMultiselectQuestionStep"
import { useFormConductor } from "../../../lib/hooks"
import { MultiselectQuestionsApplicationSectionEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import Assistant from "../../../components/assistant/General/Assistant"
import AssistantOpenButton from "../../../components/assistant/AssistantOpenButton"

const ApplicationPreferencesAll = () => {
  const { listing } = useFormConductor("preferences")
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = React.useState(false)

  return (
    <>
      <ApplicationMultiselectQuestionStep
        applicationSection={MultiselectQuestionsApplicationSectionEnum.preferences}
        applicationStep={"preferencesAll"}
        applicationSectionNumber={
          listingSectionQuestions(listing, MultiselectQuestionsApplicationSectionEnum.programs)
            ?.length
            ? 5
            : 4
        }
        strings={{
          title: (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span>{t("application.preferences.title")}</span>
              {!isChatbotOpen && !isChatbotMinimized && (
                <AssistantOpenButton onClick={() => setIsChatbotOpen(true)} />
              )}
            </div>
          ),
          subTitle: t("application.preferences.preamble"),
        }}
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
    </>
  )
}

export default ApplicationPreferencesAll
