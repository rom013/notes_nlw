import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "sonner"

interface NewNoteCardProps {
    onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

    const [shouldShowOnboarding, setShouldShowOnboarding] = useState<boolean>(true)
    const [content, setContent] = useState<string>("")
    const [isRecording, setIsRecording] = useState<boolean>(false)

    function handleStartEditior() {
        setShouldShowOnboarding(false)
    }

    function handleContentChanged(e: ChangeEvent<HTMLTextAreaElement>) {
        setContent(e.target.value)

        if (e.target.value === '') {
            setShouldShowOnboarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if (content === "") {
            return
        }

        onNoteCreated(content)

        setContent('')
        setShouldShowOnboarding(true)

        toast.success("Nota criada com sucesso!")
    }

    function handleStartRecording() {


        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition'

        if (!isSpeechRecognitionAPIAvailable) {
            alert("O seu navegador não suporta essa função")
            return
        }

        setIsRecording(true)
        setShouldShowOnboarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new SpeechRecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true
        speechRecognition.onresult = (event) => {
            console.log(event.results);

            const trascription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            }, "")

            setContent(trascription)

        }

        speechRecognition.onerror = (error) => {
            console.error(error);

        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        speechRecognition?.stop()
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger
                className="flex flex-col text-left rounded-md bg-slate-700 p-5 gap-3 overflow-hidden hover:ring-2 hover:ring-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
            >
                <span className="text-sm font-medium text-slate-200">
                    Adicionar nota
                </span>
                <p className="text-sm leading-6 text-slate-400">
                    Grave uma nota em áudio que será convertida para texto automaticamente.
                </p>

            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-slate-900/60" />
                <Dialog.Content asChild>
                    <form
                        className="fixed left-1/2 overflow-hidden top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full h-[60vh] bg-slate-700 rounded-md flex flex-col outline-none"
                    >
                        <Dialog.Close
                            className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100"
                        >
                            <X className="size-5" />
                        </Dialog.Close>
                        <div
                            className="flex flex-1 flex-col gap-3 p-5"
                        >
                            <span className="text-sm font-medium text-slate-300">
                                Adicionar nota
                            </span>
                            {
                                shouldShowOnboarding
                                    ? (
                                        <p className="text-sm leading-6 text-slate-400">
                                            Comece <button onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline" type="button">gravando uma nota</button> em áudio ou se preferir <button className="font-medium text-lime-400 hover:underline" onClick={handleStartEditior}>utilize apenas texto</button>.
                                        </p>
                                    )
                                    : (
                                        <textarea
                                            autoFocus
                                            className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                                            onChange={handleContentChanged}
                                            value={content}
                                        />
                                    )
                            }

                        </div>

                        {
                            isRecording
                                ? <button
                                    type="button"
                                    className="w-full flex justify-center items-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                                    onClick={handleStopRecording}
                                >
                                    <div
                                        className="size-3 rounded-full bg-red-500 animate-pulse"
                                    />
                                    Gravando! (click p/ interromper)
                                </button>
                                : <button
                                    type="button"
                                    onClick={handleSaveNote}
                                    className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                                >
                                    Salvar nota
                                </button>
                        }
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}