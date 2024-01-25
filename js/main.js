Vue.component('board', {
    props: ['card', 'columnIndex', 'cardIndex'],
    template: `
        <div class="card"
             :class="{ 'completed-on-time': card.status === 'Completed on time', 'overdue': card.status === 'Overdue' }">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-date">Создано: {{ card.dateCreated }}</div>
            <div class="card-date">Последнее изменение: {{ card.lastEdited }}</div>
            <div class="card-description">{{ card.description }}</div>
            <div class="card-deadline" v-if="card.deadline">Deadline: {{ card.deadline }}</div>
            <div class="card-status" v-if="card.status">Статус: {{ card.status }}</div>
            <div v-if="card.comment">Причина: {{ card.comment }}</div>

            <div class="card-actions">
                <button v-if="columnIndex !== 3" @click="editCard">Изменить</button>
                <button @click="deleteCard" v-if="columnIndex === 0">Удалить</button>
                <button v-if="columnIndex === 0" @click="moveToInProgress">Перенести в работу</button>
                <button v-if="columnIndex === 1" @click="moveToTesting">Перенести в тестирование</button>
                <button v-if="columnIndex === 2" @click="moveToDone">Перенести в выполненные</button>
                <button v-if="columnIndex === 2" @click="onClick">Вернуть в работу</button>
                <button v-if="columnIndex === 3" @click="moveToCompletedWithDeadlineCheck">Проверить статус </button>
            </div>

            <div v-if="showEditForm" class="edit-form">
                <label>Заголовок: </label><input v-model="editedTitle" />
                <label>Описание: </label><textarea v-model="editedDescription"></textarea>
                <label>Deadline: </label><input type="date" v-model="editedDeadline" />
                <button @click="saveEdits">Сохранить</button>
                <button @click="cancelEdits">Отмена</button>
            </div>

            <div v-show="this.click">
            <form @submit.prevent="returnToInProgress"> 
                <label>Комментарий: </label><input required v-model="card.comment" placeholder="Введите комментарий" />
                <input type="submit" value="Отправить"/> 
            </form>
            </div>

        </div>
    `,
    data() {
        return {
            showEditForm: false,
            editedTitle: this.card.title,
            editedDescription: this.card.description,
            editedDeadline: this.card.deadline,
            click: false,
        };
    },
    methods: {
        editCard() {
            this.showEditForm = true;
        },
        saveEdits() {
            this.card.title = this.editedTitle;
            this.card.description = this.editedDescription;
            this.card.deadline = this.editedDeadline;
            this.card.lastEdited = new Date().toLocaleString();
            this.showEditForm = false;
        },
        onClick(){
            this.click = true;
        },
        cancelEdits() {
            this.showEditForm = false;
        },
        deleteCard() {
            this.$emit('delete-card', this.columnIndex, this.cardIndex);
        },
        moveToInProgress() {
            this.$emit('move-to-in-progress', this.card, this.columnIndex, this.cardIndex);
        },
        moveToTesting() {
            this.$emit('move-to-testing', this.card, this.columnIndex, this.cardIndex);
        },
        moveToDone() {
            this.$emit('move-to-done', this.card, this.columnIndex, this.cardIndex);
        },
        returnToInProgress() {
            try {
                const inProgressIndex = 1;
                const isCardAlreadyInInProgress = this.$parent.columns[inProgressIndex].cards.some(card => card.title === this.card.title);
    
                if (!isCardAlreadyInInProgress) {
                    this.$parent.columns[inProgressIndex].cards.push({
                        title: this.card.title,
                        description: this.card.description,
                        deadline: this.card.deadline,
                        dateCreated: this.card.dateCreated,
                        lastEdited: new Date().toLocaleString(), 
                        comment: this.card.comment
                    });
                }
    
                this.$parent.columns[this.columnIndex].cards.splice(this.cardIndex, 1);
                this.card.comment = '';
                this.click = false;
            } catch (error) {
                console.error('Ошибка в функции returnToInProgress:', error);
            }
        },
        moveToCompletedWithDeadlineCheck() {
            const completedIndex = 3;
            const deadline = new Date(this.card.deadline);
            const currentDate = new Date();

            if (currentDate > deadline) {
                this.card.status = 'С опозданием';
            } else {
                this.card.status = 'Закончено во время';
            }

            this.$parent.columns[completedIndex].cards.push({
                title: this.card.title,
                description: this.card.description,
                deadline: this.card.deadline,
                dateCreated: this.card.dateCreated,
                lastEdited: new Date().toLocaleString(),
                status: this.card.status,
                comment: this.card.comment
            });

            this.$parent.columns[this.columnIndex].cards.splice(this.cardIndex, 1);
        }
    }
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { name: 'Запланированные задачи', cards: [] },
            { name: 'Задачи в работе', cards: [] },
            { name: 'Тестирование', cards: [] },
            { name: 'Выполненные задачи', cards: [] }
        ],
        newCard: { title: '', description: '', deadline: '', comment: '' }
    },
    computed: {
        isFormValid() {
            return this.newCard.title && this.newCard.description && this.newCard.deadline;
        },
        canDelete() {
            return this.columnIndex === 0;
          },
    },
})
