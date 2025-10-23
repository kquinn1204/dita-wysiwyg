import { useTopicStore } from './stores/topicStore';
import { TopicEditor } from './components/TopicEditor/TopicEditor';
import { Button } from './components/common/Button';
import { TopicSerializer } from './editor/serializers/topicSerializer';
import { saveFile, openFile } from './utils/fileSystem';

function App() {
  const { currentTopic, createNewTopic, saveTopic, loadTopic } = useTopicStore();
  const serializer = new TopicSerializer();

  const handleNewTopic = () => {
    createNewTopic();
  };

  const handleSave = async () => {
    if (!currentTopic) return;

    try {
      const xml = serializer.toXml(currentTopic);
      await saveFile(xml, `${currentTopic.id}.dita`, '.dita');
      saveTopic(); // Mark as saved in store
    } catch (error) {
      console.error('Failed to save topic:', error);
      alert('Failed to save topic. Please try again.');
    }
  };

  const handleOpen = async () => {
    try {
      const content = await openFile('.dita');
      const topic = serializer.fromXml(content);
      loadTopic(topic);
    } catch (error) {
      console.error('Failed to open topic:', error);
      alert('Failed to open topic. Please try again.');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MVP DITA Editor</h1>
        <div className="app-actions">
          <Button onClick={handleNewTopic} variant="primary">
            New Topic
          </Button>
          <Button onClick={handleOpen} variant="secondary">
            Open
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={!currentTopic}
            tooltip={!currentTopic ? 'No topic to save' : undefined}
          >
            Save
          </Button>
        </div>
      </header>
      <main className="app-main">
        <TopicEditor />
      </main>
    </div>
  );
}

export default App;
