import React from "react"
import ApplicationMultiselectQuestionStep from "../../../components/applications/ApplicationMultiselectQuestionStep"
import { MultiselectQuestionsApplicationSectionEnum } from "@bloom-housing/shared-helpers/src/types/backend-swagger"
import Assistant from "../../../components/assistant/General/Assistant"
import AssistantOpenButton from "../../../components/assistant/AssistantOpenButton"

const ApplicationPrograms = () => {
  const [isChatbotOpen, setIsChatbotOpen] = React.useState(false)
  const [isChatbotMinimized, setIsChatbotMinimized] = React.useState(false)

  return (
    <>
      <ApplicationMultiselectQuestionStep
        applicationSection={MultiselectQuestionsApplicationSectionEnum.programs}
        applicationStep={"programs"}
        applicationSectionNumber={3}
      />

      {!isChatbotOpen && !isChatbotMinimized && (
        <div style={{ position: "absolute", top: "430px", right: "calc(50% - 25px)" }}>
          <AssistantOpenButton onClick={() => setIsChatbotOpen(true)} />
        </div>
      )}

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

export default ApplicationPrograms
